export interface IStringMention {
    type: string;
    reg: RegExp;
    denotationChar: string;
    values: {
        label: string;
        value: string;
    }[];
}
export declare const markdownToDelta: (md: string, mentions?: IStringMention[]) => any;
