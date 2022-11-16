import { CustomNode, NodeType } from './utils/Node';
export var ListType;
(function (ListType) {
    ListType["Bullet"] = "bullet";
    ListType["Ordered"] = "ordered";
})(ListType || (ListType = {}));
class DeltaToMarkdown {
    constructor() {
        this._HEADER_CHARS = [
            { before: '', after: '=' },
            { before: '', after: '-' },
            { before: '###', after: '' },
        ];
        this._listLevel = {};
    }
    _getNodeTypes(attribute) {
        if (!attribute) {
            return [];
        }
        const types = [];
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
    _getHeaderFormatting(level, content) {
        const { before, after } = this._HEADER_CHARS[level - 1];
        if (before) {
            return `${before} ${content}`;
        }
        else {
            return `${content}\n${Array(content.length + 1).join(after)}`;
        }
    }
    _getListFormatting(listType, indent, numeric, content) {
        return `${Array(indent + 1).join('    ')}${listType === ListType.Bullet ? '*' : numeric + '.'} ${content}`;
    }
    _getOtherListType(listType) {
        if (listType === ListType.Bullet) {
            return ListType.Ordered;
        }
        return ListType.Bullet;
    }
    _clearListSubLevels(listType, indentCount) {
        let allSubIndent = indentCount + 1;
        while (this._listLevel[listType][allSubIndent]) {
            delete this._listLevel[listType][allSubIndent];
            allSubIndent++;
        }
    }
    _clearOtherListTypeAncestor(listType, indentCount) {
        const otherListType = this._getOtherListType(listType);
        let allParentIndent = indentCount;
        while (allParentIndent > -1) {
            if (this._listLevel[otherListType] && this._listLevel[otherListType][allParentIndent]) {
                delete this._listLevel[otherListType][allParentIndent];
            }
            allParentIndent--;
        }
    }
    _getNodeText(node, content, options, skipResettingList = false) {
        if ((node === null || node === void 0 ? void 0 : node.type) && (node === null || node === void 0 ? void 0 : node.type) !== NodeType.List && !skipResettingList) {
            this._listLevel = {};
        }
        switch (node === null || node === void 0 ? void 0 : node.type) {
            case NodeType.Bold:
                let subBoldContent = '';
                const subBoldNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subBoldNodes) {
                    subBoldContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return `**${subBoldContent ? subBoldContent : content}**`;
            case NodeType.Italic:
                let subItalicContent = '';
                const subItalicNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subItalicNodes) {
                    subItalicContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return `_${subItalicContent ? subItalicContent : content}_`;
            case NodeType.Strike:
                let subStrikeContent = '';
                const subStrikeNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subStrikeNodes) {
                    subStrikeContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return `~~${subStrikeContent ? subStrikeContent : content}~~`;
            case NodeType.Code:
                let subCodeContent = '';
                const subCodeNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subCodeNodes) {
                    subCodeContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return `\`${subCodeContent ? subCodeContent : content}\``;
            case NodeType.Link:
                return `[${content}](${options.link})`;
            case NodeType.Header:
                let subHeaderContent = '';
                const subHeaderNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subHeaderNodes) {
                    subHeaderContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return this._getHeaderFormatting(options.header, subHeaderContent);
            case NodeType.Blockquote:
                let subBlockQuoteContent = '';
                const subBlockQuoteNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subBlockQuoteNodes) {
                    subBlockQuoteContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                return `> ${subBlockQuoteContent}`;
            case NodeType.CodeBlock:
                let subCodeBlockContent = '';
                const subCodeBlockNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
                for (const subNode of subCodeBlockNodes) {
                    subCodeBlockContent += this._getNodeText(subNode, subNode.textContent, subNode.options, true);
                }
                const lineCounts = content.split('\n').length - 2;
                const postfix = Array(lineCounts + 1).join('\n');
                return `    ${subCodeBlockContent}${postfix}`;
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
                const subListNodes = (node === null || node === void 0 ? void 0 : node.children) || [];
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
    _shouldMergeWithPrevious(node) {
        switch (node === null || node === void 0 ? void 0 : node.type) {
            case NodeType.Header:
            case NodeType.Blockquote:
            case NodeType.CodeBlock:
            case NodeType.List:
                return true;
            default:
                return false;
        }
    }
    _getNodeForText(previousNode, content, types, options) {
        let lastNode = null;
        if (content !== '\n') {
            lastNode = previousNode;
            let textArray = content.split('\n') || [];
            const allLines = textArray.every(text => text.length === 0);
            if (allLines) {
                textArray = [content];
            }
            for (let i = 0; i < textArray.length; i++) {
                const text = textArray[i];
                let innerNode = null;
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
    _mergeNodes(node) {
        var _a;
        let previousNode = node.previousNode;
        while (previousNode && (previousNode.textContent !== '' || previousNode.previousNode)) {
            if (previousNode.textContent !== '\n') {
                node.previousNode = previousNode.previousNode;
                ((_a = previousNode.previousNode) === null || _a === void 0 ? void 0 : _a.nextNode) ? previousNode.previousNode.nextNode = node : null;
                previousNode.previousNode = null;
                previousNode.nextNode = null;
                node.children.unshift(previousNode);
                previousNode = node.previousNode;
            }
            else {
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
    _convertToCustomNodes(ops) {
        const firstNode = new CustomNode();
        firstNode.textContent = '';
        let previousNode = firstNode;
        for (const deltaItem of ops) {
            let node = this._getNodeForText(previousNode, deltaItem.insert, this._getNodeTypes(deltaItem.attributes), deltaItem.attributes);
            if (this._shouldMergeWithPrevious(node)) {
                node = this._mergeNodes(node);
            }
            previousNode = node;
        }
        return firstNode;
    }
    _convertCustomNodeToMd(parentNode) {
        let md = '';
        let node = parentNode;
        while (node) {
            md += this._getNodeText(node, node.textContent, node.options);
            node = node.nextNode;
        }
        return md.replace(/[\s\n]*$/gi, '');
    }
    convert(ops) {
        const firstNode = this._convertToCustomNodes(ops);
        const md = this._convertCustomNodeToMd(firstNode);
        return md;
    }
}
export const deltaToMarkdown = (ops) => {
    const dtm = new DeltaToMarkdown();
    return dtm.convert(ops);
};
