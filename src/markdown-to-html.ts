import { CustomNode, NodeType } from './utils/Node';
import { IStringMention, markdownToNodes } from './markdown-to-nodes';

export enum ListType {
    Bullet = 'bullet',
    Ordered = 'ordered'
}

class MdToHtml {
    private readonly _HEADER_CHARS = [
        'h1',
        'h2',
        'h3',
    ]

    private _listLevel: any = {};

    constructor(public mentions?: IStringMention[]) { }

    private _getHeaderFormatting(level: number, content: string): string {
        const heading = this._HEADER_CHARS[level - 1];

        return `<${heading}>${content}</${heading}>`;
    }

    private _getNodeHtml(node: CustomNode | null, content: string, options: any, skipResettingList = false): string {
        if (node?.type && node?.type !== NodeType.List && !skipResettingList) {
            this._listLevel = {};
        }

        switch (node?.type) {
            case NodeType.Bold:
                let subBoldContent = '';
                const subBoldNodes = node?.children || [];
                for (const subNode of subBoldNodes) {
                    subBoldContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return `<b>${subBoldContent ? subBoldContent : content}</b>`;

            case NodeType.Italic:
                let subItalicContent = '';
                const subItalicNodes = node?.children || [];
                for (const subNode of subItalicNodes) {
                    subItalicContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return `<i>${subItalicContent ? subItalicContent : content}</i>`;

            case NodeType.Strike:
                let subStrikeContent = '';
                const subStrikeNodes = node?.children || [];
                for (const subNode of subStrikeNodes) {
                    subStrikeContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return `<s>${subStrikeContent ? subStrikeContent : content}</s>`;

            case NodeType.Code:
                let subCodeContent = '';
                const subCodeNodes = node?.children || [];
                for (const subNode of subCodeNodes) {
                    subCodeContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return `<code>${subCodeContent ? subCodeContent : content}</code>`;

            case NodeType.Link:
                let subHtmlContent = '';
                const subHtmlNodes = node?.children || [];
                for (const subNode of subHtmlNodes) {
                    subHtmlContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return `<a href="${options.link}" target="_blank">${subHtmlContent ? subHtmlContent : content}</a>`;

            case NodeType.Header:
                let subHeaderContent = '';
                const subHeaderNodes = node?.children || [];
                for (const subNode of subHeaderNodes) {
                    subHeaderContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                return this._getHeaderFormatting(options.header, subHeaderContent);

            case NodeType.Blockquote:
                let subBlockQuoteContent = '';
                const subBlockQuoteNodes = node?.children || [];
                for (const subNode of subBlockQuoteNodes) {
                    subBlockQuoteContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                const blockquoteLineCounts = content.split('\n').length - 2;
                const blockquotePostfix = Array(blockquoteLineCounts + 1).join('\n');

                return `<blockquote>${subBlockQuoteContent}${blockquotePostfix}</blockquote>`;

            case NodeType.CodeBlock:
                let subCodeBlockContent = '';
                const subCodeBlockNodes = node?.children || [];
                for (const subNode of subCodeBlockNodes) {
                    subCodeBlockContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                const codeBlockLineCounts = content.split('\n').length - 2;
                const codeBlockPostfix = Array(codeBlockLineCounts + 1).join('\n');

                return `<pre>${subCodeBlockContent}${codeBlockPostfix}</pre>`;

            case NodeType.List:
                const listType = options.list;
                const indentCount = options.indent ? options.indent : 0;

                let listTypeTag = 'ul';
                if (listType === 'ordered') {
                    listTypeTag = 'ol';
                }

                let listOutput = '';
                if (!this._listLevel[listType]) {
                    this._listLevel[listType] = {};
                }

                if (this._listLevel['ordered'] && this._listLevel['ordered'][indentCount + 1]) {
                    listOutput += `</ol></li>`;
                    delete this._listLevel['ordered'][indentCount + 1];
                } else if (this._listLevel['bullet'] && this._listLevel['bullet'][indentCount + 1]) {
                    listOutput += `</ul></li>`;
                    delete this._listLevel['bullet'][indentCount + 1];
                }

                if (!this._listLevel[listType][indentCount]) {
                    if (indentCount > 0) {
                        listOutput += '<li>';
                    }

                    listOutput += `<${listTypeTag}>`;
                    this._listLevel[listType][indentCount] = 0;
                }

                listOutput += '<li>';
                this._listLevel[listType][indentCount]++;

                let subListContent = '';
                const subListNodes = node?.children || [];
                for (const subNode of subListNodes) {
                    subListContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options, true);
                }

                listOutput += subListContent;
                listOutput += '</li>';

                if (node?.nextNode?.type !== NodeType.List) {
                    listOutput += `</${listTypeTag}>`;

                    let bullet = this._listLevel['bullet'];
                    if (bullet) {
                        for (let i = 0; i < Object.keys(bullet).length - 1; i++) {
                            listOutput += `</li></ul>`;
                        }
                        delete this._listLevel['bullet'];
                    }

                    let ordered = this._listLevel['ordered'];
                    if (ordered) {
                        for (let i = 0; i < Object.keys(ordered).length - 1; i++) {
                            listOutput += `</li></ol>`;
                        }
                        delete this._listLevel['ordered'];
                    }
                }

                return listOutput;

            default:
                if (node?.options?.type) {
                    return `<span class="mention-item ${node.options.type}-type">${node.options.value}</span>`;
                }

                const removeNextLine = node?.previousNode && node.previousNode.type === NodeType.Blockquote;
                const removePrevLine = node?.nextNode && node.nextNode.type !== null;
                if (content === '\n' && removeNextLine && removePrevLine) {
                    return '';
                }

                return content.replace(/\n\n/gi, '<br>');
        }
    }

    private _convertCustomNodeToHtml(parentNode: CustomNode): string {
        let html = '';
        let node: CustomNode | null = parentNode;
        while (node) {
            html += this._getNodeHtml(node, node.textContent, node.options);
            node = node.nextNode;
        }

        return html.replace(/[\s\n]*$/gi, '');
    }

    private _getCleanHtml(html: string): string {
        // New Lines
        html = html.replace(/\n/gi, '<br>');

        // Heading
        html = html
            .replace(/<\/h1><br>/gi, '</h1>')
            .replace(/<\/h2><br>/gi, '</h2>')
            .replace(/<\/h3><br>/gi, '</h3>');

        // List
        html = html
            .replace(/<\/li><li><ul>/gi, '<ul>')
            .replace(/<\/li><li><ol>/gi, '<ol>');

        // Trim last new line
        if (html.endsWith('<br>')) {
            html = html.slice(0, -4);
        }

        return html;
    }

    convert(md: string): string {
        const firstNode = markdownToNodes(md, this.mentions);
        const html = this._convertCustomNodeToHtml(firstNode);
        const postProcessed = this._getCleanHtml(html);

        return postProcessed;
    }
}

export const markdownToHtml = (md: string, mentions?: IStringMention[]) => {
    const dtm = new MdToHtml(mentions);
    return dtm.convert(md + '\n');
};
