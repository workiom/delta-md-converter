import deltaToMdConverter from '../src/index'
import { IStringMention } from '../src/markdown-to-nodes';

describe('Markdown to Delta', () => {
    test('Bold, Italic, Strike and Link', () => {
        const ops = deltaToMdConverter.markdownToDelta("https://mid.ru/ru/press_service/minister_speeches/1597874");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "link": "https://mid.ru/ru/press_service/minister_speeches/1597874"
                },
                "insert": "https://mid.ru/ru/press_service/minister_speeches/1597874"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bold, Italic, Strike and Link', () => {
        const ops = deltaToMdConverter.markdownToDelta("**Bold** _Italic_ ~~Strike~~ [Link](http://link.com)");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "insert": " "
            },
            {
                "attributes": {
                    "italic": true
                },
                "insert": "Italic"
            },
            {
                "insert": " "
            },
            {
                "attributes": {
                    "strike": true
                },
                "insert": "Strike"
            },
            {
                "insert": " "
            },
            {
                "attributes": {
                    "link": "http://link.com"
                },
                "insert": "Link"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Heading', () => {
        const ops = deltaToMdConverter.markdownToDelta("Head 1\n======\n\nHead 2\n------\n\n### Head 3");

        expect(ops).toStrictEqual([
            {
                "insert": "Head 1"
            },
            {
                "attributes": {
                    "header": 1
                },
                "insert": "\n"
            },
            {
                "insert": "Head 2"
            },
            {
                "attributes": {
                    "header": 2
                },
                "insert": "\n"
            },
            {
                "insert": "Head 3"
            },
            {
                "attributes": {
                    "header": 3
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bold, Italic, Strike and Link', () => {
        const ops = deltaToMdConverter.markdownToDelta("* List item with [Link](http://link.com)");

        expect(ops).toStrictEqual([
            {
                "insert": "List item with "
            },
            {
                "attributes": {
                    "link": "http://link.com"
                },
                "insert": "Link"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Heading with text', () => {
        const ops = deltaToMdConverter.markdownToDelta("Head 1\n======\n\nsome text\n\nHead 2\n------\n\nsome text\n\n### Head 3\n\nsome text");

        expect(ops).toStrictEqual([
            {
                insert: "Head 1",
            },
            {
                insert: "\n",
                attributes: {
                    header: 1,
                },
            },
            {
                insert: "some text\n",
            },
            {
                insert: "Head 2",
            },
            {
                insert: "\n",
                attributes: {
                    header: 2,
                },
            },
            {
                insert: "some text\n",
            },
            {
                insert: "Head 3",
            },
            {
                insert: "\n",
                attributes: {
                    header: 3,
                },
            },
            {
                insert: "some text\n",
            },
        ]);
    });

    test('Heading with list', () => {
        const ops = deltaToMdConverter.markdownToDelta("Head 1\n========\n\n* Bullet list 1\n\nHead 2\n------\n\n* Bullet list 2\n\n### Head 3\n\n* Bullet list 3");

        expect(ops).toStrictEqual([
            {
                insert: "Head 1",
            },
            {
                insert: "\n",
                attributes: {
                    header: 1,
                },
            },
            {
                insert: "Bullet list 1",
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                insert: "Head 2",
            },
            {
                insert: "\n",
                attributes: {
                    header: 2,
                },
            },
            {
                insert: "Bullet list 2",
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                insert: "Head 3",
            },
            {
                insert: "\n",
                attributes: {
                    header: 3,
                },
            },
            {
                insert: "Bullet list 3",
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    })

    test('Text after header', () => {
        const ops = deltaToMdConverter.markdownToDelta("Head 1\n======\n\nNormal text");

        expect(ops).toStrictEqual([
            {
                "insert": "Head 1"
            },
            {
                "attributes": {
                    "header": 1
                },
                "insert": "\n"
            },
            {
                "insert": "Normal text\n"
            }
        ]);
    });

    test('Text after list', () => {
        const ops = deltaToMdConverter.markdownToDelta("* List 1\n\nNormal text");

        expect(ops).toStrictEqual([
            {
                "insert": "List 1"
            },
            {
                "attributes": {
                    "list": 'bullet'
                },
                "insert": "\n"
            },
            {
                "insert": "Normal text\n"
            }
        ]);
    });

    test('Quote, Code And Code block', () => {
        const ops = deltaToMdConverter.markdownToDelta("> Quote\n\n`Code`\n\n    Code Block");

        expect(ops).toStrictEqual([
            {
                "insert": "Quote"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n"
            },
            {
                "attributes": {
                    "code": true
                },
                "insert": "Code"
            },
            {
                "insert": '\n'
            },
            {
                "insert": "Code Block"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bullet List', () => {
        const ops = deltaToMdConverter.markdownToDelta("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n        * Level 1 - 1 - 2\n\n    * Level 1 - 2\n\n* Level 2\n\n    * Level 2 - 1\n\n* Level 3\n\n* Level 4");

        expect(ops).toStrictEqual([
            {
                "insert": "Level 1"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1 - 1"
            },
            {
                "attributes": {
                    "indent": 2,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1 - 2"
            },
            {
                "attributes": {
                    "indent": 2,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 2"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 2"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 2 - 1"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 3"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 4"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Ordered List', () => {
        const ops = deltaToMdConverter.markdownToDelta("1. Level 1\n\n    1. Level 1 - 1\n\n        1. Level 1 - 1 - 1\n\n        2. Level 1 - 1 - 2\n\n    2. Level 1 - 2\n\n2. Level 2\n\n    1. Level 2 - 1\n\n3. Level 3\n\n4. Level 4");

        expect(ops).toStrictEqual([
            {
                "insert": "Level 1"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1 - 1"
            },
            {
                "attributes": {
                    "indent": 2,
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 1 - 2"
            },
            {
                "attributes": {
                    "indent": 2,
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 1 - 2"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 2"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 2 - 1"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 3"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Level 4"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Ordered And Bullet List', () => {
        const ops = deltaToMdConverter.markdownToDelta("1. Ordered 1\n\n    * Bullet 1\n\n    * Bullet 2\n\n1. Ordered 1\n\n2. Ordered 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Ordered 1"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Bullet 1"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Bullet 2"
            },
            {
                "attributes": {
                    "indent": 1,
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "Ordered 1"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Ordered 2"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Code Block After List', () => {
        const ops = deltaToMdConverter.markdownToDelta("1. Ordered 1\n\n2. Ordered 2\n\n    Code Block");

        expect(ops).toStrictEqual([
            {
                "insert": "Ordered 1"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Ordered 2"
            },
            {
                "attributes": {
                    "list": "ordered"
                },
                "insert": "\n"
            },
            {
                "insert": "Code Block"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Combine Bold And Italic', () => {
        const ops = deltaToMdConverter.markdownToDelta("**Bold** **_Bold & Italic_**");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "insert": " "
            },
            {
                "attributes": {
                    "italic": true,
                    "bold": true
                },
                "insert": "Bold & Italic"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Combine Italic And Strike', () => {

        const ops = deltaToMdConverter.markdownToDelta("_~~Italic And Strike~~_");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "strike": true,
                    "italic": true
                },
                "insert": "Italic And Strike"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bold Inside List', () => {
        const ops = deltaToMdConverter.markdownToDelta("* **Bold**");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            }, {
                "insert": "\n"
            }
        ]);
    });

    test('Bold After Bold', () => {
        const ops = deltaToMdConverter.markdownToDelta("**Bold**\n\n**Bold**");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "insert": "\n"
            },
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bold & Italic Inside List', () => {
        const ops = deltaToMdConverter.markdownToDelta("* **Bold** **_Bold & Italic_**");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "bold": true
                },
                "insert": "Bold"
            },
            {
                "insert": " "
            },
            {
                "attributes": {
                    "italic": true,
                    "bold": true
                },
                "insert": "Bold & Italic"
            },
            {
                "attributes": {
                    "list": "bullet"
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Bold Inside List', () => {
        const ops = deltaToMdConverter.markdownToDelta("**Bold text**\n\n1. Some text with **bold** text");

        expect(ops).toStrictEqual([
            {
                insert: "Bold text",
                attributes: {
                    bold: true,
                },
            },
            {
                insert: "\n",
            },
            {
                insert: "Some text with ",
            },
            {
                insert: "bold",
                attributes: {
                    bold: true,
                },
            },
            {
                insert: " text",
            },
            {
                insert: "\n",
                attributes: {
                    list: "ordered",
                },
            },
            {
                insert: "\n",
            },
        ]);
    });

    test('Link With Underscore', () => {
        const ops = deltaToMdConverter.markdownToDelta("[Link with underscore](http://link_with_underscore.com)");

        expect(ops).toEqual([
            {
                "insert": "Link with underscore",
                "attributes": {
                    "link": "http://link_with_underscore.com"
                }
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Link and Name With Underscore', () => {
        const ops = deltaToMdConverter.markdownToDelta("[Link_with_underscore](http://link_with_underscore.com)");

        expect(ops).toEqual([
            {
                "insert": "Link_with_underscore",
                "attributes": {
                    "link": "http://link_with_underscore.com"
                }
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Empty Lines', () => {
        const ops = deltaToMdConverter.markdownToDelta("Line 1\n\n\n\n\n\nLine 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Line 1\n\n\nLine 2\n"
            }
        ]);
    });

    test('Tabs', () => {
        const ops = deltaToMdConverter.markdownToDelta("\t\tWith tabs");

        expect(ops).toStrictEqual([
            {
                "insert": '\t\tWith tabs\n'
            }
        ]);
    });

    test('Multiline Code Block', () => {
        const ops = deltaToMdConverter.markdownToDelta("    Code block 1\n\n    Code block 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Code block 1"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            },
            {
                "insert": "Code block 2"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Multiline Inside Code Block', () => {
        const ops = deltaToMdConverter.markdownToDelta("    Code block 1\n\n\n    Code block 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Code block 1"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n\n"
            },
            {
                "insert": "Code block 2"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Multiline Blockquote', () => {
        const ops = deltaToMdConverter.markdownToDelta("> Blockquote 1\n\n> Blockquote 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Blockquote 1"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n"
            },
            {
                "insert": "Blockquote 2"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Multiline Inside Blockquote', () => {
        const ops = deltaToMdConverter.markdownToDelta("> Blockquote 1\n\n\n> Blockquote 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Blockquote 1"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n\n"
            },
            {
                "insert": "Blockquote 2"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Multiline Inside Blockquote', () => {
        const ops = deltaToMdConverter.markdownToDelta("> Blockquote 1\n\n\n> Blockquote 2");

        expect(ops).toStrictEqual([
            {
                "insert": "Blockquote 1"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n\n"
            },
            {
                "insert": "Blockquote 2"
            },
            {
                "attributes": {
                    "blockquote": true
                },
                "insert": "\n"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    test('Complex link', () => {
        const ops = deltaToMdConverter.markdownToDelta("[Complex Link](http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query)\n\n[Google Map Link](https://www.google.com/maps/dir/33.5051595,36.3103176/33.5043544,36.3131017/@33.5047211,36.312464,19z/data=!3m1!4b1!4m2!4m1!3e0?hl=ar)");

        expect(ops).toStrictEqual([
            {
                "attributes": {
                    "link": "http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query"
                },
                "insert": "Complex Link"
            },
            {
                "insert": "\n"
            },
            {
                "attributes": {
                    "link": "https://www.google.com/maps/dir/33.5051595,36.3103176/33.5043544,36.3131017/@33.5047211,36.312464,19z/data=!3m1!4b1!4m2!4m1!3e0?hl=ar"
                },
                "insert": "Google Map Link"
            },
            {
                "insert": "\n"
            }
        ]);
    });

    // Mentions
    test('Mention User', () => {
        const mentions: IStringMention[] = [{
            type: 'mention',
            reg: /_U_([0-9]+)/gi,
            denotationChar: '@',
            values: [{
                label: 'User Name',
                value: '1234'
            }, {
                label: 'User 2',
                value: '5678'
            }]
        }];
        const ops = deltaToMdConverter.markdownToDelta("User _U_1234 Some Value", mentions);

        expect(ops).toStrictEqual([
            {
                "insert": "User "
            },
            {
                "insert": {
                    "mention": {
                        "index": "0",
                        "denotationChar": "@",
                        "value": "User Name",
                        "id": "1234"
                    }
                },
            },
            {
                insert: " Some Value\n",
            },
        ]);
    });

    // Customer case
    test('Invalid links styles', () => {
        const ops = deltaToMdConverter.markdownToDelta("[Google](https://google.com) ,_\n\n[Google 2](https://google.com) ,_\n\n_[Google 3]https://google.com)");

        expect(ops).toStrictEqual([
            {
                insert: "Google",
                attributes: {
                    link: "https://google.com",
                },
            },
            {
                insert: " ,_\n",
            },
            {
                insert: "Google 2",
                attributes: {
                    link: "https://google.com",
                },
            },
            {
                insert: " ,",
            },
            {
                insert: "\n",
                attributes: {
                    italic: true,
                },
            },
            {
                insert: "[Google 3]https://google.com)\n",
            },
        ]);
    });
});
