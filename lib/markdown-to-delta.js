import { CustomNode, NodeType } from "./utils/Node";
import { Parser } from 'simple-text-parser';
class MarkdownToDelta {
    _parseText(text) {
        const parser = new Parser();
        // List Bullet
        parser.addRule(/(^|\n)( *)\*(?!\*) (.*)[\n$]/gi, (tag, line, spaces, cleanTag) => {
            const indent = Math.floor(spaces.length / 4);
            const options = { list: 'bullet' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: NodeType.List, text: tag, value: { text: cleanTag, options: options } };
        });
        // List Ordered
        parser.addRule(/(^|\n)( *)[0-9]+\. (.*)[\n$]/gi, (tag, line, spaces, cleanTag) => {
            const indent = Math.floor(spaces.length / 4);
            const options = { list: 'ordered' };
            if (indent > 0) {
                options.indent = indent;
            }
            return { type: NodeType.List, text: tag, value: { text: cleanTag, options: options } };
        });
        // Bold
        parser.addRule(/\*\*((?:[^\*]\*?)*)\*\*/gi, (tag, cleanTag) => {
            return { type: NodeType.Bold, text: tag, value: { text: cleanTag } };
        });
        // Italic
        parser.addRule(/\_([^_]*)\_/gi, (tag, cleanTag) => {
            return { type: NodeType.Italic, text: tag, value: { text: cleanTag } };
        });
        // Strike
        parser.addRule(/\~\~((?:[^\~]\~?)*)\~\~/gi, (tag, cleanTag) => {
            return { type: NodeType.Strike, text: tag, value: { text: cleanTag } };
        });
        // Link
        parser.addRule(/\[([^\]]*)\]\(([^\)]*)\)/gi, (tag, linkLabel, linkUrl) => {
            return { type: NodeType.Link, text: tag, value: { text: linkLabel, options: { link: linkUrl } } };
        });
        // Header 1
        parser.addRule(/(.*)\n=+\n[\n$]/gi, (tag, cleanTag) => {
            return { type: NodeType.Header, text: tag, value: { text: cleanTag, options: { header: 1 } } };
        });
        // Header 2
        parser.addRule(/(.*)\n-+\n[\n$]/gi, (tag, cleanTag) => {
            return { type: NodeType.Header, text: tag, value: { text: cleanTag, options: { header: 2 } } };
        });
        // Header 3
        parser.addRule(/(^|\n)\#+\s(.*)\n/gi, (tag, lines, cleanTag) => {
            return { type: NodeType.Header, text: tag, value: { text: cleanTag, options: { header: 3 } } };
        });
        // Quote
        parser.addRule(/(^|\n)\>\s(.*)\n/gi, (tag, lines, cleanTag) => {
            return { type: NodeType.Blockquote, text: tag, value: { text: cleanTag } };
        });
        // Code
        parser.addRule(/\`([^`]*)\`/gi, (tag, cleanTag) => {
            return { type: NodeType.Code, text: tag, value: { text: cleanTag } };
        });
        // Block Code
        parser.addRule(/(^|\n)    (.*)/gi, (tag, lines, cleanTag) => {
            return { type: NodeType.CodeBlock, text: tag, value: { text: cleanTag } };
        });
        const tree = parser.toTree(text);
        for (let i = 0; i < tree.length; i++) {
            const treeItem = tree[i];
            if (treeItem.type !== 'text') {
                const subTree = this._parseText(treeItem.value.text);
                tree[i] = Object.assign(Object.assign({}, treeItem), { subTree: subTree || [] });
            }
        }
        return tree;
    }
    _typeFiltering(types) {
        const newTypes = [];
        for (let i = types.length - 1; i > -1; i--) {
            const type = types[i];
            if (type !== NodeType.List || newTypes.length === 0) {
                newTypes.push(type);
            }
        }
        return newTypes;
    }
    _convertTreeNodesToCustomNodes(treeNodes, previousNode, types = [], subItem = false) {
        var _a, _b;
        let lastNode = previousNode;
        for (const treeItem of treeNodes) {
            if (treeItem.type === 'text') {
                const node = new CustomNode();
                node.type = null;
                node.textContent = treeItem.text;
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
                }
                else {
                    node.previousNode = lastNode;
                    lastNode.nextNode = node;
                    lastNode = node;
                }
            }
            else if (treeItem.subTree.length > 0) {
                const node = new CustomNode();
                node.type = null;
                node.textContent = '';
                const nodeTypes = this._typeFiltering([treeItem.type]);
                if (subItem) {
                    lastNode.type = types[0];
                    lastNode.children.push(node);
                    const innerNode = this._convertTreeNodesToCustomNodes(treeItem.subTree, node, nodeTypes, true);
                    innerNode.options = ((_a = treeItem.value) === null || _a === void 0 ? void 0 : _a.options) || null;
                }
                else {
                    node.previousNode = lastNode;
                    lastNode.nextNode = node;
                    lastNode = node;
                    lastNode = this._convertTreeNodesToCustomNodes(treeItem.subTree, lastNode, nodeTypes, true);
                    lastNode.options = ((_b = treeItem.value) === null || _b === void 0 ? void 0 : _b.options) || null;
                }
            }
        }
        return lastNode;
    }
    _getAttributeForType(node) {
        var _a, _b, _c, _d;
        const attributes = {};
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
                }
                else {
                    const blockquote = new CustomNode();
                    blockquote.textContent = '\n';
                    blockquote.type = NodeType.Blockquote;
                    blockquote.previousNode = node;
                    blockquote.nextNode = node.nextNode;
                    if ((_a = node.nextNode) === null || _a === void 0 ? void 0 : _a.previousNode) {
                        node.nextNode.previousNode = blockquote;
                    }
                    node.nextNode = blockquote;
                }
                break;
            case NodeType.CodeBlock:
                if (node.textContent === '\n') {
                    attributes['code-block'] = true;
                }
                else {
                    const codeBlock = new CustomNode();
                    codeBlock.textContent = '\n';
                    codeBlock.type = NodeType.CodeBlock;
                    codeBlock.previousNode = node;
                    codeBlock.nextNode = node.nextNode;
                    if ((_b = node.nextNode) === null || _b === void 0 ? void 0 : _b.previousNode) {
                        node.nextNode.previousNode = codeBlock;
                    }
                    node.nextNode = codeBlock;
                }
                break;
            case NodeType.Header:
                if (node.textContent === '\n') {
                    attributes['header'] = node.options.header;
                }
                else {
                    const header = new CustomNode();
                    header.textContent = '\n';
                    header.type = NodeType.Header;
                    header.options = { header: node.options.header };
                    header.previousNode = node;
                    header.nextNode = node.nextNode;
                    if ((_c = node.nextNode) === null || _c === void 0 ? void 0 : _c.previousNode) {
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
                }
                else {
                    const list = new CustomNode();
                    list.textContent = '\n';
                    list.type = NodeType.List;
                    const options = { list: node.options.list };
                    if (node.options.indent) {
                        options.indent = node.options.indent;
                    }
                    list.options = options;
                    list.previousNode = node;
                    list.nextNode = node.nextNode;
                    if ((_d = node.nextNode) === null || _d === void 0 ? void 0 : _d.previousNode) {
                        node.nextNode.previousNode = list;
                    }
                    node.nextNode = list;
                }
                break;
        }
        return attributes;
    }
    _getAttributesFromNodeType(node, attributes = {}) {
        attributes = Object.assign(Object.assign({}, attributes), this._getAttributeForType(node));
        for (const child of node.children) {
            attributes = Object.assign(Object.assign({}, attributes), this._getAttributesFromNodeType(child, attributes));
        }
        return attributes;
    }
    _getTextsFromNodeType(node) {
        let content = node.textContent;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            content += this._getTextsFromNodeType(child);
        }
        return content;
    }
    _convertToCustomNodes(md) {
        const treeNodes = this._parseText(md);
        const node = new CustomNode();
        this._convertTreeNodesToCustomNodes(treeNodes, node);
        return node;
    }
    _canCombine(type) {
        if (type === NodeType.List) {
            return false;
        }
        return true;
    }
    _convertCustomNodesToDelta(firstNode) {
        let lastNode = firstNode;
        const ops = [];
        while (lastNode) {
            if (lastNode.textContent !== '' || lastNode.previousNode) {
                if (lastNode.children.length > 0) {
                    if (this._canCombine(lastNode.type)) {
                        const attributes = this._getAttributesFromNodeType(lastNode);
                        const text = this._getTextsFromNodeType(lastNode);
                        const opsItem = {
                            insert: text
                        };
                        if (JSON.stringify(attributes) !== '{}') {
                            opsItem.attributes = attributes;
                        }
                        ops.push(opsItem);
                    }
                    else {
                        for (const child of lastNode.children) {
                            const attributes = this._getAttributesFromNodeType(child);
                            const text = this._getTextsFromNodeType(child);
                            const opsItem = {
                                insert: text
                            };
                            if (JSON.stringify(attributes) !== '{}') {
                                opsItem.attributes = attributes;
                            }
                            ops.push(opsItem);
                        }
                        lastNode.textContent = '\n';
                        const opsItem = {
                            insert: '\n'
                        };
                        const attributes = this._getAttributeForType(lastNode);
                        if (JSON.stringify(attributes) !== '{}') {
                            opsItem.attributes = attributes;
                        }
                        ops.push(opsItem);
                    }
                }
                else {
                    const attributes = this._getAttributesFromNodeType(lastNode);
                    const text = this._getTextsFromNodeType(lastNode);
                    const opsItem = {
                        insert: text
                    };
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
    _normalizeDelta(convertedOps) {
        const ops = [];
        for (let i = 0; i < convertedOps.length; i++) {
            const opItem = convertedOps[i];
            // Skip Empty text
            if (opItem.insert === '') {
                continue;
            }
            // Skip New line after block
            const lastOps = ops[ops.length - 1];
            const lastOpsWithoutNewLine = lastOps && lastOps.attributes && (lastOps.attributes['header'] ||
                lastOps.attributes['blockquote'] ||
                lastOps.attributes['code-block'] ||
                lastOps.attributes['list']);
            if (lastOpsWithoutNewLine && opItem.insert === '\n' && !opItem.attributes) {
                continue;
            }
            if (opItem.insert === '\n\n' && !opItem.attributes) {
                const prevOps = convertedOps[i - 1];
                const nextOps = convertedOps[i + 2];
                if (prevOps && nextOps && JSON.stringify(prevOps.attributes) === JSON.stringify(nextOps.attributes)) {
                    prevOps.insert = '\n\n';
                    continue;
                }
            }
            // Change double lines in any text
            opItem.insert = opItem.insert.replace(/\n\n/gi, '\n');
            // Skip new line after list
            if (opItem.insert.startsWith('\n') && opItem.insert.length > 1 && lastOps && lastOps.attributes.list) {
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
    convert(md) {
        const customNode = this._convertToCustomNodes(md + '\n');
        const convertedOps = this._convertCustomNodesToDelta(customNode);
        const ops = this._normalizeDelta(convertedOps);
        return ops;
    }
}
export const markdownToDelta = (md) => {
    const mtd = new MarkdownToDelta();
    return mtd.convert(md);
};
