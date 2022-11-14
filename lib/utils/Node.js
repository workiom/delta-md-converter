export var NodeType;
(function (NodeType) {
    NodeType[NodeType["Bold"] = 0] = "Bold";
    NodeType[NodeType["Italic"] = 1] = "Italic";
    NodeType[NodeType["Strike"] = 2] = "Strike";
    NodeType[NodeType["Link"] = 3] = "Link";
    NodeType[NodeType["Header"] = 4] = "Header";
    NodeType[NodeType["Blockquote"] = 5] = "Blockquote";
    NodeType[NodeType["Code"] = 6] = "Code";
    NodeType[NodeType["CodeBlock"] = 7] = "CodeBlock";
    NodeType[NodeType["List"] = 8] = "List";
})(NodeType || (NodeType = {}));
export class CustomNode {
    constructor() {
        this.type = null;
        this.textContent = '';
        this.previousNode = null;
        this.nextNode = null;
        this.children = [];
    }
}
