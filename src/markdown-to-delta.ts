import { IStringMention, markdownToNodes } from "./markdown-to-nodes";
import { CustomNode, NodeType } from "./utils/Node";

class MarkdownToDelta {

    constructor(public mentions?: IStringMention[]) { }

    private _getAttributeForType(node: CustomNode): any {
        const attributes: any = {};

        switch (node.type) {
            case NodeType.Bold:
                attributes['bold'] = true;
                break;

            case NodeType.Italic:
                attributes['italic'] = true;
                break;

            case NodeType.Strike:
                attributes['strike'] = true;
                break;

            case NodeType.Link:
                attributes['link'] = node.options.link;
                break;

            case NodeType.Code:
                attributes['code'] = true;
                break;

            case NodeType.Blockquote:
                if (node.textContent === '\n') {
                    attributes['blockquote'] = true;
                } else {
                    const blockquote = new CustomNode();
                    blockquote.textContent = '\n';
                    blockquote.type = NodeType.Blockquote;
                    blockquote.previousNode = node;
                    blockquote.nextNode = node.nextNode;
                    if (node.nextNode?.previousNode) {
                        node.nextNode.previousNode = blockquote;
                    }
                    node.nextNode = blockquote;
                }
                break;

            case NodeType.CodeBlock:
                if (node.textContent === '\n') {
                    attributes['code-block'] = true;
                } else {
                    const codeBlock = new CustomNode();
                    codeBlock.textContent = '\n';
                    codeBlock.type = NodeType.CodeBlock;
                    codeBlock.previousNode = node;
                    codeBlock.nextNode = node.nextNode;
                    if (node.nextNode?.previousNode) {
                        node.nextNode.previousNode = codeBlock;
                    }
                    node.nextNode = codeBlock;
                }
                break;

            case NodeType.Header:
                if (node.textContent === '\n') {
                    attributes['header'] = node.options.header;
                } else {
                    const header = new CustomNode();
                    header.textContent = '\n';
                    header.type = NodeType.Header;
                    header.options = { header: node.options.header };
                    header.previousNode = node;
                    header.nextNode = node.nextNode;
                    if (node.nextNode?.previousNode) {
                        node.nextNode.previousNode = header;
                    }
                    node.nextNode = header;
                }
                break;

            case NodeType.List:
                if (node.textContent === '\n') {
                    attributes['list'] = node.options.list;
                    if (node.options.indent) {
                        attributes['indent'] = node.options.indent;
                    }
                } else {
                    const list = new CustomNode();
                    list.textContent = '\n';
                    list.type = NodeType.List;
                    const options: any = { list: node.options.list };
                    if (node.options.indent) {
                        options.indent = node.options.indent;
                    }
                    list.options = options;
                    list.previousNode = node;
                    list.nextNode = node.nextNode;
                    if (node.nextNode?.previousNode) {
                        node.nextNode.previousNode = list;
                    }
                    node.nextNode = list;
                }
                break;
        }

        return attributes;
    }

    private _getAttributesFromNodeType(node: CustomNode, attributes: any = {}): any {
        attributes = {
            ...attributes,
            ...this._getAttributeForType(node)
        };
        for (const child of node.children) {
            attributes = {
                ...attributes,
                ...this._getAttributesFromNodeType(child, attributes)
            };
        }

        return attributes;
    }

    private _getTextsFromNodeType(node: CustomNode): string {
        let content = node.textContent;

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            content += this._getTextsFromNodeType(child);
        }

        return content;
    }

    private _canCombine(type: NodeType | null): boolean {
        if (type === NodeType.List) {
            return false;
        }

        return true;
    }

    private _convertCustomNodesToDelta(firstNode: CustomNode | null): any[] {
        let lastNode = firstNode;

        const ops: any[] = [];
        while (lastNode) {
            if (lastNode.textContent !== '' || lastNode.previousNode) {
                if (lastNode.children.length > 0) {
                    if (this._canCombine(lastNode.type)) {
                        const attributes = this._getAttributesFromNodeType(lastNode);
                        const text = this._getTextsFromNodeType(lastNode);

                        const opsItem: any = {
                            insert: text
                        }

                        if (JSON.stringify(attributes) !== '{}') {
                            opsItem.attributes = attributes;
                        }

                        ops.push(opsItem);
                    } else {
                        for (const child of lastNode.children) {
                            const attributes = this._getAttributesFromNodeType(child);
                            const text = this._getTextsFromNodeType(child);

                            const opsItem: any = {
                                insert: text
                            }

                            if (JSON.stringify(attributes) !== '{}') {
                                opsItem.attributes = attributes;
                            }

                            ops.push(opsItem);
                        }

                        lastNode.textContent = '\n';
                        const opsItem: any = {
                            insert: '\n'
                        }

                        const attributes = this._getAttributeForType(lastNode);

                        if (JSON.stringify(attributes) !== '{}') {
                            opsItem.attributes = attributes;
                        }

                        ops.push(opsItem);
                    }
                } else if (lastNode.type === NodeType.Mention) {
                    const options = lastNode.options;
                    const type = options.type;
                    delete options.type;
                    const insertObj = { [type]: options };

                    ops.push({
                        insert: insertObj
                    });
                } else {
                    const attributes = this._getAttributesFromNodeType(lastNode);
                    const text = this._getTextsFromNodeType(lastNode);

                    const opsItem: any = {
                        insert: text
                    }

                    if (JSON.stringify(attributes) !== '{}') {
                        opsItem.attributes = attributes;
                    }

                    ops.push(opsItem);
                }
            }

            lastNode = lastNode.nextNode;
        }

        return ops;
    }

    private _normalizeDelta(convertedOps: any): any {
        const ops: any = [];

        for (let i = 0; i < convertedOps.length; i++) {
            const opItem = convertedOps[i];

            // Skip Empty text
            if (opItem.insert === '') {
                continue;
            }

            if (this.mentions && this.mentions.length > 0) {
                let mentionFound = false;
                for (const mention of this.mentions) {
                    if (opItem.insert[mention.type]) {
                        mentionFound = true;
                        ops.push(opItem);
                        break;
                    }
                }

                if (mentionFound) {
                    continue;
                }
            }

            // Skip New line after block
            const lastOps = ops[ops.length - 1];
            const lastOpsWithoutNewLine = lastOps && lastOps.attributes && (
                lastOps.attributes['header'] ||
                lastOps.attributes['blockquote'] ||
                lastOps.attributes['code-block'] ||
                lastOps.attributes['list']
            );

            if (opItem.insert === '\n' && !opItem.attributes) {
                const prevOps = convertedOps[i - 1];
                const nextOps = convertedOps[i + 2];
                if (prevOps && nextOps && JSON.stringify(prevOps.attributes) === JSON.stringify(nextOps.attributes)) {
                    prevOps.insert = '\n\n';
                    continue;
                }
            }

            if (lastOpsWithoutNewLine && opItem.insert === '\n' && !opItem.attributes) {
                continue;
            }

            // Change double lines in any text
            opItem.insert = opItem.insert.replace(/\n\n/gi, '\n');

            // Skip new line after list
            if (opItem.insert.startsWith('\n') && opItem.insert.length > 1 && lastOps?.attributes?.list) {
                opItem.insert = opItem.insert.substring(1, opItem.insert.length);
            }

            ops.push(opItem);
        }

        if (ops.length > 0) {
            const lastOps = ops[ops.length - 1];
            const endsWithLine = lastOps.insert.endsWith('\n') && !lastOps.attributes;
            const noNewLine = lastOps.insert !== '\n' || lastOps.attributes;

            if (!endsWithLine && noNewLine) {
                ops.push({
                    "insert": '\n'
                });
            }
        }

        return ops;
    }

    convert(md: string): any {
        const customNode = markdownToNodes(md + '\n', this.mentions);
        const convertedOps = this._convertCustomNodesToDelta(customNode);
        const ops = this._normalizeDelta(convertedOps);

        return ops;
    }
}

export const markdownToDelta = (md: string, mentions?: IStringMention[]) => {
    const mtd = new MarkdownToDelta(mentions);
    return mtd.convert(md);
};
