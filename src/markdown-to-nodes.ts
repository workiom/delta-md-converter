import { CustomNode, NodeType } from "./utils/Node";
import { Parser } from 'simple-text-parser';

export interface IStringMention {
    type: string;
    reg: RegExp;
    denotationChar: string;
    values: { label: string; value: string; }[];
}

class MarkdownToNodes {

    constructor(public mentions?: IStringMention[]) { }

    private _parseText(text: string): any {
        const parser = new Parser();

        if (this.mentions && this.mentions.length > 0) {
            for (const mention of this.mentions) {
                parser.addRule(mention.reg, (tag, ...args): any => {
                    return { type: NodeType.Mention, text: tag, value: { type: mention.type, args: args } };
                });
            }
        }
        // Header 1
        parser.addRule(/(.*)\n=+\n[\n$]?/gi, (tag, cleanTag): any => {
            return { type: NodeType.Header, text: tag, value: {text: cleanTag, options: {header: 1}} };
        });
        // Header 2
        parser.addRule(/(.*)\n-+\n[\n$]?/gi, (tag, cleanTag): any => {
            return { type: NodeType.Header, text: tag, value: {text: cleanTag, options: {header: 2}} };
        });
        // Header 3
        parser.addRule(/(^|\n)\#+\s(.*)\n[\n$]?/gi, (tag, lines, cleanTag): any => {
            return { type: NodeType.Header, text: tag, value: {text: cleanTag, options: {header: 3}} };
        });
        // List Bullet
        parser.addRule(/(^|\n)( *)\*(?!\*) (.*)[\n$]/gi, (tag, line, spaces, cleanTag): any => {
            const indent = Math.floor(spaces.length / 4);
            const options: any = { list: 'bullet' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: NodeType.List, text: tag, value: {text: cleanTag, options: options} };
        });
        // List Ordered
        parser.addRule(/(^|\n)( *)[0-9]+\. (.*)[\n$]/gi, (tag, line, spaces, cleanTag): any => {
            const indent =  Math.floor(spaces.length / 4);
            const options: any = { list: 'ordered' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: NodeType.List, text: tag, value: {text: cleanTag, options: options} };
        });
        // Bold
        parser.addRule(/\*\*((?:[^\*])*)\*\*/gi, (tag, cleanTag): any => {
            return { type: NodeType.Bold, text: tag, value: {text: cleanTag} };
        });
        // Italic
        parser.addRule(/((?:(?:^|(?:\s|\*|\~))\_)|(?:\_(?:\s|\*|\~)))([^_]*)((?:(?:\s|\*|\~)\_)|(?:\_(?:(?:\s|\*|\~)|$)))/gi, (tag, before, cleanTag, after): any => {
            const spacesBefore = before.replace(/\_/g, '');
            const spacesAfter = after.replace(/\_/g, '');
            return { type: NodeType.Italic, text: tag, value: {before: spacesBefore, text: cleanTag, after: spacesAfter} };
        });
        // Strike
        parser.addRule(/\~\~((?:[^\~]\~?)*)\~\~/gi, (tag, cleanTag): any => {
            return { type: NodeType.Strike, text: tag, value: {text: cleanTag} };
        });
        // Md Link
        parser.addRule(/\[(.*?)\]\(([-a-zA-Z0-9@:%_\+.~!,#?&\/\(\)=]*)\)/gi, (tag, linkLabel, linkUrl): any => {
            return { type: NodeType.Link, text: tag, value: {text: linkLabel, options: {link: linkUrl}} };
        });
        // Link
        parser.addRule(/(?:^|\n)((?:http(s)?:\/\/.)?(?:[\w]+\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{1,63}\b(?:[-a-zA-Z0-9@:%_\+.~#!?&//=,]*))[\n$]/gi, (tag, linkUrl): any => {
            return { type: NodeType.Link, text: tag, value: {text: linkUrl, options: {link: linkUrl}} };
        });
        // Quote
        parser.addRule(/(^|\n)\>\s(.*)[\n$]/gi, (tag, lines, cleanTag): any => {
            return { type: NodeType.Blockquote, text: tag, value: {text: cleanTag} };
        });
        // Code
        parser.addRule(/\`([^`]*)\`/gi, (tag, cleanTag): any => {
            return { type: NodeType.Code, text: tag, value: {text: cleanTag} };
        });
        // Block Code
        parser.addRule(/(^|\n)    (.*)[\n$]/gi, (tag, lines, cleanTag): any => {
            return { type: NodeType.CodeBlock, text: tag, value: {text: cleanTag} };
        });

        const tree = parser.toTree(text);

        for (let i = 0; i < tree.length; i++) {
            const treeItem = tree[i];
            const treeType = treeItem.type as any;
            if (treeType !== 'text' && treeType !== NodeType.Link) {
                const subTree = this._parseText((treeItem.value as any).text);

                const before = (treeItem.value as any).before;
                const after = (treeItem.value as any).after;

                delete (treeItem.value as any).before;
                delete (treeItem.value as any).after;

                tree[i] = {
                    ...treeItem,
                    subTree: subTree || []
                };

                if (before) {
                    tree.splice(i, 0, {type: 'text', text: before, subTree: []});
                    i++;
                }

                if (after) {
                    tree.splice(i + 1, 0, {type: 'text', text: after, subTree: []});
                    i++;
                }
            } else {
                tree[i] = {
                    ...treeItem,
                    subTree: []
                };
            }
        }

        return tree;
    }

    private _typeFiltering(types: NodeType[]): NodeType[] {
        const newTypes: NodeType[] = [];

        for (let i = types.length - 1; i > -1; i--) {
            const type = types[i];
            if (type !== NodeType.List || newTypes.length === 0) {
                newTypes.push(type);
            }
        }

        return newTypes;
    }

    private _convertTreeNodesToCustomNodes(treeNodes: any, previousNode: CustomNode, types: NodeType[] = [], subItem = false): CustomNode {
        let lastNode = previousNode;
        for (const treeItem of treeNodes) {
            if (treeItem.type === 'text' || treeItem.type === NodeType.Link) {
                if (treeItem.type === 'text' && lastNode.textContent === '\n' && lastNode.textContent === treeItem.text) {
                    continue;
                }

                const node = new CustomNode();
                node.type = null;
                node.textContent = treeItem.text;

                if (treeItem.type === NodeType.Link) {
                    node.type = NodeType.Link;
                    node.textContent = treeItem.value.text;
                    node.options = treeItem.value?.options;
                }

                if (subItem) {
                    lastNode.type = types[0];
                    lastNode.children.push(node);

                    let currentNode = node;
                    for (let i = 1; i < types.length; i++) {
                        const type = types[i];
                        currentNode.textContent = '';

                        const childNode = new CustomNode();
                        childNode.type = type;
                        childNode.textContent = treeItem.text;
                        currentNode.children.push(childNode);
                        currentNode = childNode;
                    }
                } else {
                    node.previousNode = lastNode;
                    lastNode.nextNode = node;
                    lastNode = node;
                }
            } else if (treeItem.type === NodeType.Mention) {
                const node = new CustomNode();
                node.type = NodeType.Mention;
                const mention = this.mentions?.find(m => m.type === treeItem.value.type);
                const mValue = mention?.values.find(mv => mv.value.toString() === treeItem.value.args[0].toString());
                if (mention && mValue) {
                    node.options = {
                        "index": "0",
                        "denotationChar": mention.denotationChar,
                        "value": mValue.label,
                        "id": mValue.value,
                        "type": treeItem.value.type,
                    };
                } else {
                    node.options = {
                        "index": "0",
                        "denotationChar": mention?.denotationChar,
                        "value": '',
                        "id": treeItem.value.userId,
                        "type": 'mention',
                    };
                }

                node.previousNode = lastNode;
                lastNode.nextNode = node;
                lastNode = node;
            } else if (treeItem.subTree.length > 0) {
                const node = new CustomNode();
                node.type = null;
                node.textContent = '';

                const nodeTypes = this._typeFiltering([treeItem.type]);

                if (subItem) {
                    lastNode.type = types[0];
                    lastNode.children.push(node);

                    const innerNode = this._convertTreeNodesToCustomNodes(
                        treeItem.subTree,
                        node,
                        nodeTypes,
                        true
                    );

                    innerNode.options = treeItem.value?.options || null;

                } else {
                    node.previousNode = lastNode;
                    lastNode.nextNode = node;
                    lastNode = node;

                    lastNode = this._convertTreeNodesToCustomNodes(
                        treeItem.subTree,
                        lastNode,
                        nodeTypes,
                        true
                    );

                    lastNode.options = treeItem.value?.options || null;
                }

            } else {
                const node = new CustomNode();
                node.type = treeItem.type;
                node.textContent = treeItem.value.text;
                node.options = treeItem.value?.options || null;

                node.previousNode = lastNode;
                lastNode.nextNode = node;
                lastNode = node;
            }
        }

        return lastNode;
    }

    private _convertToCustomNodes(md: string): CustomNode {
        const treeNodes = this._parseText(md);

        const node = new CustomNode();
        this._convertTreeNodesToCustomNodes(treeNodes, node);

        return node;
    }

    convert(md: string): CustomNode {
        return this._convertToCustomNodes(md + '\n');
    }
}

export const markdownToNodes = (md: string, mentions?: IStringMention[]) => {
    const mtd = new MarkdownToNodes(mentions);
    return mtd.convert(md);
};
