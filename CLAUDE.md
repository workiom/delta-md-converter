# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@workiom/delta-md-converter` is a TypeScript library that converts Quill Delta ops to and from Markdown, and Markdown to HTML. Its only runtime dependency is `simple-text-parser`.

## Commands

- `npm test`: run all Jest suites (ts-jest, ESM mode).
- `npm test -- test/markdown-to-delta.spec.ts`: run one file.
- `npm test -- -t "Bullet List"`: run tests whose name matches. Add a file path to narrow further.
- `npm run build`: compile with `tsc` (strict) into `lib/`, which is gitignored. This is the only type check for `src/`. No linter or formatter is configured.
- `npm run deploy`: build, then `npm publish --access public`. This publishes to npm, so run it only when asked. Version bumps get their own `Version x.y.z` commit, touching `package.json` and `package-lock.json`.

Gotchas:
- Run Jest through `npm test`, which sets `NODE_OPTIONS=--experimental-vm-modules`. Bare `npx jest` fails with `SyntaxError: Cannot use import statement outside a module`.
- Relative imports in `src/` must end in `.js` (`./utils/Node.js`) so compiled `lib/` loads in plain Node ESM. Jest's `moduleNameMapper` strips the extension. `test/package.spec.ts` compiles into `node_modules/.cache` and imports the result with Node to guard this.
- In this repo, `npm ci` under npm 11 re-resolves transitive deps and rewrites `package-lock.json`. Revert that churn unless you mean to update the lockfile.

## Architecture

`src/index.ts` has one default export: `{ deltaToMarkdown, markdownToDelta, markdownToHtml }`, plus type exports for the mention configs. `IDeltaMention` lives in `src/delta-to-nodes.ts` and `IStringMention` in `src/markdown-to-nodes.ts`.

Every conversion goes through `CustomNode` (`src/utils/Node.ts`). It is a doubly linked list (`previousNode`/`nextNode`). Each node has:
- `type`: a `NodeType`, or `null`/`undefined` for plain text.
- `textContent`.
- `options`: link, header, list, indent, or mention data.
- `children`: nested formatting and block contents.

The list head is an empty sentinel node that renderers skip. `NodeType.Bold` is `0`, so truthiness checks such as `node?.type && …` treat bold nodes like plain text.

| Direction | Parse to nodes | Render | Post-process |
|---|---|---|---|
| Delta → MD | `delta-to-nodes.ts` | `delta-to-markdown.ts` | trim trailing whitespace |
| MD → Delta | `markdown-to-nodes.ts` | `markdown-to-delta.ts` | `_normalizeDelta()` |
| MD → HTML | `markdown-to-nodes.ts` | `markdown-to-html.ts` | `_getCleanHtml()` |

Both Markdown paths share `markdown-to-nodes.ts`. A parser change must keep both `markdown-to-delta.spec.ts` and `markdown-to-html.spec.ts` passing. Each exported function creates a new converter class instance per call, so instance state such as the `_listLevel` list numbering and nesting counters lasts for one conversion only.

### Block formats and newlines

Quill puts block formats (`header`, `blockquote`, `code-block`, `list` + `indent`) on the trailing `"\n"` op, not on the text. Each direction handles this:
- Delta → nodes: `_mergeNodes()` moves the preceding inline nodes, back to the last newline, into the block node's `children`.
- Nodes → Delta: `_getAttributeForType()` inserts a synthetic `"\n"` node after block text, carrying the block attribute. It mutates the linked list during traversal.
- Lists are never merged into a single op (`_canCombine`). Each child becomes its own op, followed by a `"\n"` op that carries `list` and `indent`.

One Delta `"\n"` equals a blank line (`\n\n`) in Markdown. Delta → Markdown doubles each newline, and `_normalizeDelta()` collapses `\n\n` back to `\n`.

### Markdown parser (`markdown-to-nodes.ts`)

`_parseText()` registers regex rules on `simple-text-parser`, and registration order sets precedence. The first rule that matches anywhere in the string splits it, and the leftover segments are re-parsed against the full rule list.
- Mention rules are registered first.
- List rules come before the 4-space code-block rule, so indented list items stay lists.
- The inner text of each match is re-parsed recursively for nested formatting. Link labels are the exception and are never parsed further.

Block rules end in `[\n$]`. That is a character class matching a newline or a literal `$`, not end-of-input. The rules work only because both `markdownToDelta` and `markdownToHtml` append `\n\n` to the input.

### Markdown dialect

The dialect is fixed and is not CommonMark. Both directions must agree on it:
- H1 and H2 are setext (`Title\n=====`, `Title\n-----`). H3 is `### Title`. Any run of `#` parses as H3, and Delta headers above level 3 render as plain text.
- Inline and quote syntax: `**bold**`, `_italic_` (underscore only), `~~strike~~`, `` `code` ``, `> quote`.
- Code blocks are indented 4 spaces. Fences aren't supported.
- Bullet items use `* ` and ordered items use `N. `. Each `indent` level is 4 spaces.
- Links are `[label](url)` only. Bare URLs aren't auto-linked.

### Mentions

Each direction takes a different config:
- Delta → Markdown uses `IDeltaMention { key, prefix, postfix, valueKey }`. An embed `{ insert: { [key]: {...} } }` renders as `prefix + insert[key][valueKey] + postfix`, for example `_U_1234`.
- Markdown → Delta/HTML uses `IStringMention { type, reg, denotationChar, values: [{ label, value }] }`. Capture group 1 of `reg` is looked up in `values`.
  - Delta output is an embed: `{ [type]: { index, denotationChar, value: label, id } }`.
  - HTML output is `<span class="mention-item {type}-type">{denotationChar}{label}</span>`.

A round trip works only if `prefix` and `reg` agree, for example `_U_` with `/_U_([0-9]+)/gi`.

## Tests

`test/` has one spec per public function. Cases assert exact strings or ops (`toEqual`/`toStrictEqual`), so a whitespace or newline change in any renderer breaks many cases.
