import { CustomNode, NodeType } from "./utils/Node";
import { Parser } from 'simple-text-parser';

class MarkdownToDelta {

    private _convertTreeNodesToCustomNodes(treeNodes: any, previousNode: CustomNode, defaultTypes: NodeType[] = []): CustomNode {
        let lastNode = previousNode;
        for (const treeItem of treeNodes) {
            if (treeItem.type === 'text') {
                const node = new CustomNode();
                node.type = defaultTypes;
                node.textContent = treeItem.text;
                node.previousNode = lastNode;
                lastNode.nextNode = node;
                lastNode = node;
            } else if (treeItem.subTree.length > 0) {
                lastNode = this._convertTreeNodesToCustomNodes(treeItem.subTree, lastNode, [...defaultTypes, ...treeItem.type]);
                lastNode.options = treeItem.value?.options || null;
            }
        }

        return lastNode;
    }

    private _parseText(text: string, defaultTypes: NodeType[] = []): any {
        const parser = new Parser();
        // Bold
        parser.addRule(/\*\*(.*)\*\*/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Bold], text: tag, value: {text: cleanTag} };
        });
        // Italic
        parser.addRule(/_(.*)_/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Italic], text: tag, value: {text: cleanTag} };
        });
        // Strike
        parser.addRule(/~~(.*)~~/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Strike], text: tag, value: {text: cleanTag} };
        });
        // Link
        parser.addRule(/\[(.*)\]\((.*)\)/gi, (tag, linkLabel, linkUrl): any => {
            return { type: [...defaultTypes, NodeType.Link], text: tag, value: {text: linkLabel, options: {link: linkUrl}} };
        });
        // Header 1
        parser.addRule(/(.*)\n=+\n/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Header], text: tag, value: {text: cleanTag, options: {header: 1}} };
        });
        // Header 2
        parser.addRule(/(.*)\n-+\n/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Header], text: tag, value: {text: cleanTag, options: {header: 2}} };
        });
        // Header 3
        parser.addRule(/\#+\s(.*)\n/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Header], text: tag, value: {text: cleanTag, options: {header: 3}} };
        });
        // List Bullet
        parser.addRule(/( *)\*\s(.*)[\n$]/gi, (tag, spaces, cleanTag): any => {
            const indent =  Math.floor(spaces.length / 4);
            const options: any = { list: 'bullet' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: [...defaultTypes, NodeType.List], text: tag, value: {text: cleanTag, options: options} };
        });
        // List Ordered
        parser.addRule(/( *)[0-9]+\.\s(.*)[\n$]/gi, (tag, spaces, cleanTag): any => {
            const indent =  Math.floor(spaces.length / 4);
            const options: any = { list: 'ordered' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: [...defaultTypes, NodeType.List], text: tag, value: {text: cleanTag, options: options} };
        });
        // Quote
        parser.addRule(/\>\s(.*)\n/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Blockquote], text: tag, value: {text: cleanTag} };
        });
        // Code
        parser.addRule(/`(.*)`/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.Code], text: tag, value: {text: cleanTag} };
        });
        // Block Code
        parser.addRule(/    (.*)/gi, (tag, cleanTag): any => {
            return { type: [...defaultTypes, NodeType.CodeBlock], text: tag, value: {text: cleanTag} };
        });

        const tree = parser.toTree(text);

        for (let i = 0; i < tree.length; i++) {
            const treeItem = tree[i];
            if (treeItem.type !== 'text') {
                const subTree = this._parseText((treeItem.value as any).text, treeItem.type as any);
                tree[i] = {
                    ...treeItem,
                    subTree: subTree || []
                };
            }

        }

        return tree;
    }

    private _getAttributesFromNodeType(node: CustomNode): void {
        const attributes: any = {};
        const nodeTypes = node.type;
        for (const type of nodeTypes) {
            switch(type) {
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
                        blockquote.type = [NodeType.Blockquote];
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
                        codeBlock.type = [NodeType.CodeBlock];
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
                        header.type = [NodeType.Header];
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
                        list.type = [NodeType.List];
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
        }

        return attributes;
    }

    private _convertToCustomNodes(md: string): CustomNode {
        const treeNodes = this._parseText(md);

        const node = new CustomNode();
        this._convertTreeNodesToCustomNodes(treeNodes, node);

        return node;
    }

    private _convertCustomNodesToDelta(firstNode: CustomNode): any[] {
        const ops = [];
        let lastNode: CustomNode | null = firstNode;

        while(lastNode) {
            if (lastNode.textContent) {
                const opsItem: any = {
                    insert: lastNode.textContent
                }

                const attributes = this._getAttributesFromNodeType(lastNode);
                if (JSON.stringify(attributes) !== '{}') {
                    opsItem.attributes = attributes;
                }

                ops.push(opsItem);
            }

            lastNode = lastNode.nextNode;
        }

        return ops;
    }

    private _normalizeDelta(convertedOps: any): any {
        const ops: any = [];

        for (const opItem of convertedOps) {
            const lastOps = ops[ops.length - 1];
            const lastOpsWithoutNewLine = lastOps && lastOps.attributes && (
                lastOps.attributes['header'] ||
                lastOps.attributes['blockquote'] ||
                lastOps.attributes['code-block'] ||
                lastOps.attributes['list']
            );

            if (lastOpsWithoutNewLine && opItem.insert === '\n' && !opItem.attributes) {
                continue;
            }

            if (opItem.insert === '\n\n') {
                opItem.insert = '\n';
            }

            ops.push(opItem);
        }

        if (ops.length > 0) {
            const lastOps = ops[ops.length - 1];
            if (lastOps.insert !== '\n' || lastOps.attributes) {
                ops.push({
                    "insert": '\n'
                });
            }
        }

        return ops;
    }

    convert(md: string): any {
        const customNode = this._convertToCustomNodes(md + '\n');
        const convertedOps = this._convertCustomNodesToDelta(customNode);
        const ops = this._normalizeDelta(convertedOps);

        return ops;
    }
}

export const markdownToDelta = (md: string) => {
    const mtd = new MarkdownToDelta();
    return mtd.convert(md);
};
