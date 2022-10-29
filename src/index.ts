import { deltaToMarkdown } from './delta-to-markdown';
import { markdownToDelta } from './markdown-to-delta';

export const deltaToMdConverter = {
    deltaToMarkdown,
    markdownToDelta
};

// deltaToMdConverter.deltaToMarkdown([{"attributes":{"bold":true},"insert":"bold"},{"insert":"\n"},{"attributes":{"italic":true},"insert":"italic"},{"insert":"\n"},{"attributes":{"strike":true},"insert":"strike"},{"insert":"\n"},{"attributes":{"link":"https://google.com"},"insert":"link"},{"insert":"\nhead1"},{"attributes":{"header":1},"insert":"\n"},{"insert":"head2"},{"attributes":{"header":2},"insert":"\n"},{"insert":"head3"},{"attributes":{"header":3},"insert":"\n"},{"insert":"quote"},{"attributes":{"blockquote":true},"insert":"\n"},{"attributes":{"code":true},"insert":"code"},{"insert":"\nblock"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"😁\n"},{"insert":"level1"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"level2"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},{"insert":"level2-1."},{"attributes":{"indent":2,"list":"bullet"},"insert":"\n"},{"insert":"level1"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"level2"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"level2-1."},{"attributes":{"list":"ordered"},"insert":"\n"}]);
// deltaToMdConverter.deltaToMarkdown([{"attributes":{"bold":true},"insert":"bold"},{"insert":"\n"},{"attributes":{"strike":true},"insert":"strike"},{"insert":"\n"},{"attributes":{"italic":true},"insert":"italic"},{"insert":"\n"},{"attributes":{"link":"http://link.com"},"insert":"link"},{"insert":"\nHeader1"},{"attributes":{"header":1},"insert":"\n"},{"insert":"Header2"},{"attributes":{"header":2},"insert":"\n"},{"insert":"Header3"},{"attributes":{"header":3},"insert":"\n"},{"insert":"Quote"},{"attributes":{"blockquote":true},"insert":"\n"},{"attributes":{"code":true},"insert":"code"},{"insert":"\nBlock"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"bullet1"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"bullet2"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"bullet2-1"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},{"insert":"bullet2-2"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},{"insert":"ordered1"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"ordered2"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"ordered2-1"},{"attributes":{"indent":1,"list":"ordered"},"insert":"\n"},{"insert":"ordered2-2"},{"attributes":{"indent":1,"list":"ordered"},"insert":"\n"},{"insert":"ordered2-2-1"},{"attributes":{"indent":2,"list":"ordered"},"insert":"\n"},{"insert":"ordered2-2-2"},{"attributes":{"indent":2,"list":"ordered"},"insert":"\n"},{"insert":"ordered3"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"ordered4"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"bullet"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"ordered1"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"\n"}]);
// deltaToMdConverter.deltaToMarkdown([{"insert":"ordered1"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"bullet"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"ordered1"},{"attributes":{"list":"ordered"},"insert":"\n"},{"insert":"\n"}]);
// deltaToMdConverter.deltaToMarkdown([{"insert":"A"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"A1"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},{"insert":"B"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"B1"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},{"insert":"C"},{"attributes":{"list":"bullet"},"insert":"\n"},{"insert":"C1"},{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"}]);

// deltaToMdConverter.deltaToMarkdown([{"attributes": {"bold": true},"insert": "bold"},{"insert": " "},{"attributes": {"italic": true},"insert": "italic"},{"insert": " "},{"attributes": {"strike": true},"insert": "strike"},{"insert": " "},{"attributes": {"link": "http://link.com"},"insert": "link"},{"insert": "\n"}]);
deltaToMdConverter.deltaToMarkdown([
    {
        "insert": "level 1"
    },
    {
        "attributes": {
            "list": "bullet"
        },
        "insert": "\n"
    },
    {
        "insert": "level 2"
    },
    {
        "attributes": {
            "list": "bullet"
        },
        "insert": "\n"
    },
    {
        "insert": "Blocl"
    },
    {
        "attributes": {
            "code-block": true
        },
        "insert": "\n"
    }
]);
