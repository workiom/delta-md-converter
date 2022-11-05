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
}

export class CustomNode {
    type: NodeType[] = [];
    textContent: string = '';
    previousNode: CustomNode | null = null;
    nextNode: CustomNode | null = null;
    options: any;

    constructor() { }
}
