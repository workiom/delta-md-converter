export declare enum NodeType {
    Bold = 0,
    Italic = 1,
    Strike = 2,
    Link = 3,
    Header = 4,
    Blockquote = 5,
    Code = 6,
    CodeBlock = 7,
    List = 8
}
export declare class CustomNode {
    type: NodeType | null;
    textContent: string;
    previousNode: CustomNode | null;
    nextNode: CustomNode | null;
    options: any;
    children: CustomNode[];
    constructor();
}
