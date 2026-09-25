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

    private _listStack: { tag: string, indent: number }[] = [];

    constructor(public mentions?: IStringMention[]) { }

    private readonly _SAFE_URL_PROTOCOLS = ['http', 'https', 'mailto', 'tel', 'ftp'];

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    private _isSafeUrl(url: string): boolean {
        const protocol = url.trim().match(/^([a-z][a-z0-9+.-]*):/i);

        return !protocol || this._SAFE_URL_PROTOCOLS.includes(protocol[1].toLowerCase());
    }

    private _getHeaderFormatting(level: number, content: string): string {
        const heading = this._HEADER_CHARS[level - 1];

        return `<${heading}>${content}</${heading}>`;
    }

    private _getNodeHtml(node: CustomNode | null, content: string, options: any): string {
        switch (node?.type) {
            case NodeType.Bold:
                let subBoldContent = '';
                const subBoldNodes = node?.children || [];
                for (const subNode of subBoldNodes) {
                    subBoldContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                return `<b>${subBoldContent ? subBoldContent : this._escapeHtml(content)}</b>`;

            case NodeType.Italic:
                let subItalicContent = '';
                const subItalicNodes = node?.children || [];
                for (const subNode of subItalicNodes) {
                    subItalicContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                return `<i>${subItalicContent ? subItalicContent : this._escapeHtml(content)}</i>`;

            case NodeType.Strike:
                let subStrikeContent = '';
                const subStrikeNodes = node?.children || [];
                for (const subNode of subStrikeNodes) {
                    subStrikeContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                return `<s>${subStrikeContent ? subStrikeContent : this._escapeHtml(content)}</s>`;

            case NodeType.Code:
                let subCodeContent = '';
                const subCodeNodes = node?.children || [];
                for (const subNode of subCodeNodes) {
                    subCodeContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                return `<code>${subCodeContent ? subCodeContent : this._escapeHtml(content)}</code>`;

            case NodeType.Link:
                let subHtmlContent = '';
                const subHtmlNodes = node?.children || [];
                for (const subNode of subHtmlNodes) {
                    subHtmlContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                const linkLabel = subHtmlContent ? subHtmlContent : this._escapeHtml(content);
                if (!this._isSafeUrl(options.link)) {
                    return linkLabel;
                }

                return `<a href="${this._escapeHtml(options.link)}" target="_blank">${linkLabel}</a>`;

            case NodeType.Header:
                let subHeaderContent = '';
                const subHeaderNodes = node?.children || [];
                for (const subNode of subHeaderNodes) {
                    subHeaderContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                return this._getHeaderFormatting(options.header, subHeaderContent);

            case NodeType.Blockquote:
                let subBlockQuoteContent = '';
                const subBlockQuoteNodes = node?.children || [];
                for (const subNode of subBlockQuoteNodes) {
                    subBlockQuoteContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                const blockquoteLineCounts = content.split('\n').length - 2;
                const blockquotePostfix = Array(blockquoteLineCounts + 1).join('\n');

                return `<blockquote>${subBlockQuoteContent}${blockquotePostfix}</blockquote>`;

            case NodeType.CodeBlock:
                let subCodeBlockContent = '';
                const subCodeBlockNodes = node?.children || [];
                for (const subNode of subCodeBlockNodes) {
                    subCodeBlockContent += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                const codeBlockLineCounts = content.split('\n').length - 2;
                const codeBlockPostfix = Array(codeBlockLineCounts + 1).join('\n');

                return `<pre>${subCodeBlockContent ? subCodeBlockContent : this._escapeHtml(content)}${codeBlockPostfix}</pre>`;

            case NodeType.List:
                const listTag = options.list === 'ordered' ? 'ol' : 'ul';
                const indentCount = options.indent ? options.indent : 0;

                let listOutput = '';

                // Close deeper levels, and the same level when list type changes
                let openList = this._listStack[this._listStack.length - 1];
                while (openList && (openList.indent > indentCount || (openList.indent === indentCount && openList.tag !== listTag))) {
                    listOutput += `</li></${openList.tag}>`;
                    this._listStack.pop();
                    openList = this._listStack[this._listStack.length - 1];
                }

                if (openList && openList.indent === indentCount) {
                    listOutput += '</li><li>';
                } else {
                    listOutput += `<${listTag}><li>`;
                    this._listStack.push({ tag: listTag, indent: indentCount });
                }

                const subListNodes = node?.children || [];
                for (const subNode of subListNodes) {
                    listOutput += this._getNodeHtml(subNode, subNode.textContent, subNode.options);
                }

                if (node?.nextNode?.type !== NodeType.List) {
                    while (this._listStack.length > 0) {
                        listOutput += `</li></${this._listStack.pop()!.tag}>`;
                    }
                }

                return listOutput;

            default:
                if (node?.options?.type) {
                    const mentionType = this._escapeHtml(node.options.type);
                    const mentionText = this._escapeHtml(`${node.options.denotationChar}${node.options.value}`);
                    return `<span class="mention-item ${mentionType}-type">${mentionText}</span>`;
                }

                const removeNextLine = node?.previousNode && node.previousNode.type === NodeType.Blockquote;
                const removePrevLine = node?.nextNode && node.nextNode.type !== null;
                if (content === '\n' && removeNextLine && removePrevLine) {
                    return '';
                }

                return this._escapeHtml(content).replace(/\n\n/gi, '<br>');
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
