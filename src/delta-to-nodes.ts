import { CustomNode, NodeType } from './utils/Node';

export enum ListType {
    Bullet = 'bullet',
    Ordered = 'ordered'
}

export interface IDeltaMention {
    key: string;
    prefix: string;
    postfix: string;
    valueKey: string;
}

class DeltaToNodes {
    private readonly _HEADER_CHARS = [
        { before: '', after: '=' },
        { before: '', after: '-' },
        { before: '###', after: '' },
    ]

    constructor(public mentions?: IDeltaMention[]) { }

    private _getNodeTypes(attribute: any): NodeType[] {
        if (!attribute) {
            return [];
        }

        const types: NodeType[] = [];
        if (attribute['bold']) {
            types.push(NodeType.Bold);
        }

        if (attribute['italic']) {
            types.push(NodeType.Italic);
        }

        if (attribute['strike']) {
            types.push(NodeType.Strike);
        }

        if (attribute['link']) {
            types.push(NodeType.Link);
        }

        if (attribute['header']) {
            types.push(NodeType.Header);
        }

        if (attribute['blockquote']) {
            types.push(NodeType.Blockquote);
        }

        if (attribute['code']) {
            types.push(NodeType.Code);
        }

        if (attribute['code-block']) {
            types.push(NodeType.CodeBlock);
        }

        if (attribute['list']) {
            types.push(NodeType.List);
        }

        return types;
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

    private _getContentText(content: any): string {
        if (typeof content === 'string') {
            return content;
        } else if (this.mentions && this.mentions.length > 0) {
            for (const mention of this.mentions) {
                if (content[mention.key]) {
                    return mention.prefix + content[mention.key][mention.valueKey] + mention.postfix;
                }
            }
        }

        return '';
    }

    private _getNodeForText(previousNode: CustomNode, content: any, types: NodeType[], options: any): CustomNode {
        let lastNode: CustomNode | null = null;
        if (content !== '\n') {
            lastNode = previousNode;
            const contentText = this._getContentText(content);
            let textArray = contentText.split('\n') || [];
            const allLines = textArray.every(text => text.length === 0);
            if (allLines) {
                textArray = [contentText];
            }

            for (let i = 0; i < textArray.length; i++) {
                const text = textArray[i];

                let innerNode: CustomNode | null = null;

                if (text) {
                    innerNode = new CustomNode();
                    innerNode.type = types[0];
                    innerNode.options = options;
                    innerNode.textContent = text;
                    innerNode.previousNode = lastNode || null;
                    lastNode ? lastNode.nextNode = innerNode : null;
                    lastNode = innerNode;

                    if (types.length > 1) {
                        let currentNode = lastNode;
                        for (let i = 1; i < types.length; i++) {
                            const type = types[i];
                            currentNode.textContent = '';

                            const childNode = new CustomNode();
                            childNode.type = type;
                            childNode.options = options;
                            childNode.textContent = text;
                            currentNode.children.push(childNode);
                            currentNode = childNode;
                        }
                    }
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
        }

        let defaultNode = new CustomNode();
        if (!lastNode) {
            defaultNode.textContent = content;
            defaultNode.options = options;
            defaultNode.type = types[0];
            defaultNode.previousNode = lastNode || previousNode;
            (lastNode || previousNode).nextNode = defaultNode;
        }

        return lastNode || defaultNode;
    }

    private _mergeNodes(node: CustomNode): CustomNode {
        let previousNode = node.previousNode;

        while (previousNode && (previousNode.textContent !== '' || previousNode.previousNode)) {
            if (previousNode.textContent !== '\n') {
                node.previousNode = previousNode.previousNode;
                previousNode.previousNode?.nextNode ? previousNode.previousNode.nextNode = node : null;

                previousNode.previousNode = null;
                previousNode.nextNode = null;

                node.children.unshift(previousNode);
                previousNode = node.previousNode;
            } else {
                break;
            }
        }

        let lastNode = node;
        if (node.children.length > 0) {
            lastNode = new CustomNode();
            lastNode.textContent = '\n';
            lastNode.previousNode = node;
            node.nextNode = lastNode;
        }

        return lastNode;
    }

    private _convertToCustomNodes(ops: any): CustomNode {
        const firstNode = new CustomNode();
        firstNode.textContent = '';
        let previousNode: CustomNode | null = firstNode;

        for (const deltaItem of ops) {
            let node = this._getNodeForText(
                previousNode,
                deltaItem.insert,
                this._getNodeTypes(deltaItem.attributes),
                deltaItem.attributes
            );

            if (this._shouldMergeWithPrevious(node)) {
                node = this._mergeNodes(node);
            }

            previousNode = node;
        }

        return firstNode;
    }

    convert(ops: any): CustomNode {
        return this._convertToCustomNodes(ops);
    }
}

export const deltaToNodes = (ops: any, mentions?: IDeltaMention[]) => {
    const dtm = new DeltaToNodes(mentions);
    return dtm.convert(ops);
};
