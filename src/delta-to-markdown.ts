import { CustomNode, NodeType } from './utils/Node';
import { IDeltaMention, deltaToNodes } from './delta-to-nodes';

export enum ListType {
    Bullet = 'bullet',
    Ordered = 'ordered'
}

class DeltaToMarkdown {
    private readonly _HEADER_CHARS = [
        { before: '', after: '=' },
        { before: '', after: '-' },
        { before: '###', after: '' },
    ]

    private _listLevel: any = {};

    constructor(public mentions?: IDeltaMention[]) { }

    private _getHeaderFormatting(level: number, content: string): string {
        const { before, after } = this._HEADER_CHARS[level - 1];

        if (before) {
            return `${before} ${content}`;
        } else {
            return `${content}\n${Array(content.length + 1).join(after)}`;
        }
    }

    private _getListFormatting(listType: ListType, indent: number, numeric: number, content: string): string {
        return `${Array(indent + 1).join('    ')}${listType === ListType.Bullet ? '*' : numeric + '.'} ${content}`;
    }

    private _getOtherListType(listType: ListType.Bullet | ListType.Ordered): ListType.Bullet | ListType.Ordered {
        if (listType === ListType.Bullet) {
            return ListType.Ordered;
        }

        return ListType.Bullet;
    }

    private _clearListSubLevels(listType: ListType, indentCount: number): void {
        let allSubIndent = indentCount + 1;
        while (this._listLevel[listType][allSubIndent]) {
            delete this._listLevel[listType][allSubIndent];
            allSubIndent++;
        }
    }

    private _clearOtherListTypeAncestor(listType: ListType, indentCount: number): void {
        const otherListType = this._getOtherListType(listType);

        let allParentIndent = indentCount;
        while (allParentIndent > -1) {
            if (this._listLevel[otherListType] && this._listLevel[otherListType][allParentIndent]) {
                delete this._listLevel[otherListType][allParentIndent];
            }
            allParentIndent--;
        }
    }

    private _getNodeText(node: CustomNode | null, content: string, options: any, skipResettingList = false): string {
        if (node?.type && node?.type !== NodeType.List && !skipResettingList) {
            this._listLevel = {};
        }

        switch (node?.type) {
            case NodeType.Bold:
                let subBoldContent = '';
                const subBoldNodes = node?.children || [];
                for (const subNode of subBoldNodes) {
                    subBoldContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return `**${subBoldContent ? subBoldContent : content}**`;

            case NodeType.Italic:
                let subItalicContent = '';
                const subItalicNodes = node?.children || [];
                for (const subNode of subItalicNodes) {
                    subItalicContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return `_${subItalicContent ? subItalicContent : content}_`;

            case NodeType.Strike:
                let subStrikeContent = '';
                const subStrikeNodes = node?.children || [];
                for (const subNode of subStrikeNodes) {
                    subStrikeContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return `~~${subStrikeContent ? subStrikeContent : content}~~`;

            case NodeType.Code:
                let subCodeContent = '';
                const subCodeNodes = node?.children || [];
                for (const subNode of subCodeNodes) {
                    subCodeContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return `\`${subCodeContent ? subCodeContent : content}\``;

            case NodeType.Link:
                return `[${content}](${options.link})`;

            case NodeType.Header:
                let subHeaderContent = '';
                const subHeaderNodes = node?.children || [];
                for (const subNode of subHeaderNodes) {
                    subHeaderContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return this._getHeaderFormatting(options.header, subHeaderContent);

            case NodeType.Blockquote:
                let subBlockQuoteContent = '';
                const subBlockQuoteNodes = node?.children || [];
                for (const subNode of subBlockQuoteNodes) {
                    subBlockQuoteContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                const blockquoteLineCounts = content.split('\n').length - 2;
                const blockquotePostfix = Array(blockquoteLineCounts + 1).join('\n');

                return `> ${subBlockQuoteContent}${blockquotePostfix}`;

            case NodeType.CodeBlock:
                let subCodeBlockContent = '';
                const subCodeBlockNodes = node?.children || [];
                for (const subNode of subCodeBlockNodes) {
                    subCodeBlockContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                const codeBlockLineCounts = content.split('\n').length - 2;
                const codeBlockPostfix = Array(codeBlockLineCounts + 1).join('\n');

                return `    ${subCodeBlockContent}${codeBlockPostfix}`;

            case NodeType.List:
                const listType = options.list;
                const indentCount = options.indent ? options.indent : 0;

                if (!this._listLevel[listType]) {
                    this._listLevel[listType] = {};
                }

                if (!this._listLevel[listType][indentCount]) {
                    this._listLevel[listType][indentCount] = 0;
                }

                this._listLevel[listType][indentCount]++;

                this._clearListSubLevels(listType, indentCount);
                this._clearOtherListTypeAncestor(listType, indentCount);

                let subListContent = '';
                const subListNodes = node?.children || [];
                for (const subNode of subListNodes) {
                    subListContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }

                return this._getListFormatting(listType, indentCount, this._listLevel[listType][indentCount], subListContent);

            default:
                if (content === '\n') {
                    return '\n\n';
                }

                return content;
        }
    }

    private _convertCustomNodeToMd(parentNode: CustomNode): string {
        let md = '';
        let node: CustomNode | null = parentNode;
        while (node) {
            md += this._getNodeText(node, node.textContent, node.options);
            node = node.nextNode;
        }

        return md.replace(/[\s\n]*$/gi, '');
    }

    convert(ops: any): string {
        const firstNode = deltaToNodes(ops, this.mentions);
        const md = this._convertCustomNodeToMd(firstNode);

        return md;
    }
}

export const deltaToMarkdown = (ops: any, mentions?: IDeltaMention[]) => {
    const dtm = new DeltaToMarkdown(mentions);
    return dtm.convert(ops);
};
