export declare enum ListType {
    Bullet = "bullet",
    Ordered = "ordered"
}
export interface IDeltaMention {
    key: string;
    prefix: string;
    postfix: string;
    valueKey: string;
}
export declare const deltaToMarkdown: (ops: any, mentions?: IDeltaMention[]) => string;
