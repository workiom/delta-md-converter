export enum NodeType {
    Bold,
    Italic,
    Strike,
    Link,
    Header,
    Blockquote,
    Code,
    CodeBlock,
    List,
    Mention,
}

export class CustomNode {
    type: NodeType | null = null;
    textContent: string = '';
    previousNode: CustomNode | null = null;
    nextNode: CustomNode | null = null;
    options: any;
    children: CustomNode[] = [];

    constructor() { }
}
