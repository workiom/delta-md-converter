import { execFileSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Package', () => {
    const cacheDir = join(process.cwd(), 'node_modules', '.cache');
    let outDir = '';

    beforeAll(() => {
        mkdirSync(cacheDir, { recursive: true });
        outDir = mkdtempSync(join(cacheDir, 'package-spec-'));
        execFileSync(join(process.cwd(), 'node_modules', '.bin', 'tsc'), ['--outDir', outDir]);
    }, 60000);

    afterAll(() => {
        rmSync(outDir, { recursive: true, force: true });
    });

    test('Compiled output loads in Node ESM', () => {
        const script = `import converter from ${JSON.stringify(join(outDir, 'index.js'))};
            console.log(JSON.stringify(converter.markdownToDelta('**Bold**')));`;
        const output = execFileSync('node', ['--input-type=module', '-e', script], { encoding: 'utf8' });

        expect(JSON.parse(output)).toStrictEqual([
            { insert: 'Bold', attributes: { bold: true } },
            { insert: '\n' },
        ]);
    });
});
