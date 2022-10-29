import { CustomNode, NodeType } from './utils/Node';

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

    private _getNodeType(attribute: any): NodeType | null {
        if (!attribute) {
            return null;
        }

        if (attribute['bold']) {
            return NodeType.Bold;
        }

        if (attribute['italic']) {
            return NodeType.Italic;
        }

        if (attribute['strike']) {
            return NodeType.Strike;
        }

        if (attribute['link']) {
            return NodeType.Link;
        }

        if (attribute['header']) {
            return NodeType.Header;
        }

        if (attribute['blockquote']) {
            return NodeType.Blockquote;
        }

        if (attribute['code']) {
            return NodeType.Code;
        }

        if (attribute['code-block']) {
            return NodeType.CodeBlock;
        }

        if (attribute['list']) {
            return NodeType.List;
        }

        return null;
    }

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

    private _getNodeText(node: CustomNode | null, content: string, options: any): string {
        if (node?.type && node?.type !== NodeType.List) {
            this._listLevel = {};
        }

        switch (node?.type) {
            case NodeType.Bold:
                return `**${content}**`;

            case NodeType.Italic:
                return `_${content}_`;

            case NodeType.Strike:
                return `~~${content}~~`;

            case NodeType.Link:
                return `[${content}](${options.link})`;

            case NodeType.Header:
                return this._getHeaderFormatting(options.header, content);

            case NodeType.Blockquote:
                return `> ${content}`;

            case NodeType.Code:
                return `\`${content}\``;

            case NodeType.CodeBlock:
                return `    ${content}`;

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

                return this._getListFormatting(listType, indentCount, this._listLevel[listType][indentCount], content);

            default:
                if (content === '\n') {
                    return '\n\n';
                }

                return content;
        }
    }

    private _shouldMergeWithPrevious(node: CustomNode | null): boolean {
        switch (node?.type) {
            case NodeType.Header:
            case NodeType.Blockquote:
            case NodeType.CodeBlock:
            case NodeType.List:
                return true;

            default:
                return false;
        }
    }

    private _mergeNodes(frNode: CustomNode | null, sdNode: CustomNode | null): CustomNode {
        const textArray = frNode?.textContent.split('\n') || [];

        let lastNode = frNode?.previousNode;
        for (let i = 0; i < textArray.length; i++) {
            const text = textArray[i];
            let innerNode: CustomNode | null = null;

            if (text) {
                innerNode = new CustomNode();
                innerNode.type = null;
                innerNode.options = null;
                innerNode.textContent = text;
                innerNode.previousNode = lastNode || null;
                lastNode ? lastNode.nextNode = innerNode : null;
                lastNode = innerNode;
            }

            if (i + 1 < textArray.length) {
                innerNode = new CustomNode();
                innerNode.type = null;
                innerNode.options = null;
                innerNode.textContent = '\n';
                innerNode.previousNode = lastNode || null;
                lastNode ? lastNode.nextNode = innerNode : null;
                lastNode = innerNode;
            }
        }

        if (lastNode) {
            lastNode.type = sdNode ? sdNode.type : null;
            lastNode.options = sdNode?.options;
        }

        const nextNode = new CustomNode();
        nextNode.type = null;
        nextNode.options = null;
        nextNode.textContent = sdNode ? sdNode.textContent : '';
        nextNode.previousNode = lastNode || null;
        lastNode ? lastNode.nextNode = nextNode : null;
        return nextNode;
    }

    private _convertToCustomNodes(ops: any): CustomNode {
        const firstNode = new CustomNode();
        firstNode.textContent = '';
        let previousNode: CustomNode | null = firstNode;

        for (const deltaItem of ops) {
            let node = new CustomNode();
            node.textContent = deltaItem.insert;
            node.options = deltaItem.attributes;
            node.type = this._getNodeType(deltaItem.attributes);

            if (this._shouldMergeWithPrevious(node)) {
                node = this._mergeNodes(previousNode, node);
                previousNode = node.previousNode;
            }

            node.previousNode = previousNode;
            previousNode ? previousNode.nextNode = node : null;

            previousNode = node;
        }

        return firstNode;
    }

    private _convertCustomNodeToMd(parentNode: CustomNode): string {
        let md = '';
        let node: CustomNode | null = parentNode;
        while (node) {
            md += this._getNodeText(node, node.textContent, node.options);
            node = node.nextNode;
        }

        return md.trim();
    }

    convert(ops: any): string {
        const firstNode = this._convertToCustomNodes(ops);
        const md = this._convertCustomNodeToMd(firstNode);

        return md;
    }
}

export const deltaToMarkdown = (ops: any) => {
    const dtm = new DeltaToMarkdown();
    return dtm.convert(ops);
};
