import { IDeltaMention } from '../src/delta-to-nodes';
import deltaToMdConverter from '../src/index'

describe('Delta to Markdown', () => {
    test('Bold, Italic, Strike and Link', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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

        expect(md).toEqual("**Bold** _Italic_ ~~Strike~~ [Link](http://link.com)");
    });

    test('Heading', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("Head 1\n======\n\nHead 2\n------\n\n### Head 3");
    });

    test('Text after header', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
                "insert": "Normal text"
            }
        ]);

        expect(md).toEqual("Head 1\n======\n\nNormal text");
    });

    test('Text after list', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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

        expect(md).toEqual("* List 1\n\nNormal text");
    });

    test('Quote, Code And Code block', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
                "insert": "\nCode Block"
            },
            {
                "attributes": {
                    "code-block": true
                },
                "insert": "\n"
            }
        ]);

        expect(md).toEqual("> Quote\n\n`Code`\n\n    Code Block");
    });

    test('Bullet List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n        * Level 1 - 1 - 2\n\n    * Level 1 - 2\n\n* Level 2\n\n    * Level 2 - 1\n\n* Level 3\n\n* Level 4");
    });

    test('Ordered List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("1. Level 1\n\n    1. Level 1 - 1\n\n        1. Level 1 - 1 - 1\n\n        2. Level 1 - 1 - 2\n\n    2. Level 1 - 2\n\n2. Level 2\n\n    1. Level 2 - 1\n\n3. Level 3\n\n4. Level 4");
    });

    test('Ordered And Bullet List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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

        expect(md).toEqual("1. Ordered 1\n\n    * Bullet 1\n\n    * Bullet 2\n\n1. Ordered 1\n\n2. Ordered 2");
    });

    test('Code Block After List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
                "insert": "\n\n"
            }
        ]);

        expect(md).toEqual("1. Ordered 1\n\n2. Ordered 2\n\n    Code Block");
    });

    test('Combine Bold And Italic', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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

        expect(md).toEqual("**Bold** **_Bold & Italic_**");
    });

    test('Combine Italic And Strike', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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

        expect(md).toEqual("_~~Italic And Strike~~_");
    });

    test('Bold Inside List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("* **Bold**");
    });

    test('Bold & Italic Inside List', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("* **Bold** **_Bold & Italic_**");
    });

    test('Link With Underscore', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "attributes": {
                    "link": "http://link_with_underscore.com"
                },
                "insert": "Link with underscore"
            },
            {
                "insert": "\n"
            }
        ]);

        expect(md).toEqual("[Link with underscore](http://link_with_underscore.com)");
    });

    test('Empty Lines', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": "Line 1\n\n\nLine 2\n"
            }
        ]);

        expect(md).toEqual("Line 1\n\n\n\n\n\nLine 2");
    });

    test('Tabs', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": '\t\tWith tabs\n'
            }
        ]);

        expect(md).toEqual("\t\tWith tabs");
    });

    test('Multiline Code Block', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("    Code block 1\n\n    Code block 2");
    });

    test('Multiline Inside Code Block', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("    Code block 1\n\n\n    Code block 2");
    });

    test('Multiline Blockquote', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("> Blockquote 1\n\n> Blockquote 2");
    });

    test('Multiline Inside Blockquote', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
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
            }
        ]);

        expect(md).toEqual("> Blockquote 1\n\n\n> Blockquote 2");
    });

    test('Complex link', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "attributes": {
                    "link": "http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query"
                },
                "insert": "Complex Link\n"
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

        expect(md).toEqual("[Complex Link](http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query)\n\n[Google Map Link](https://www.google.com/maps/dir/33.5051595,36.3103176/33.5043544,36.3131017/@33.5047211,36.312464,19z/data=!3m1!4b1!4m2!4m1!3e0?hl=ar)");
    });

    // Mentions And Fields
    test('Mention and Fields User', () => {
        const mentions: IDeltaMention[] = [{
            key: 'mention',
            prefix: '_U_',
            postfix: '',
            valueKey: 'id',
        }, {
            key: 'field',
            prefix: '_F_',
            postfix: '',
            valueKey: 'id',
        }];
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": {
                    "mention": {
                        "index": "0",
                        "denotationChar": "@",
                        "value": "User Name",
                        "id": "1234"
                    }
                },
            }, {
                "insert": " ",
            }, {
                "insert": {
                    "field": {
                        "type": 0,
                        "id": "123456_A_00000000z0000z0000z0000z000000000000",
                        "value": "Some Field"
                    }
                }
            }, {
                "insert": " ",
            }, {
                "insert": "Some Field"
            }
        ], mentions);

        expect(md).toEqual("_U_1234 _F_123456_A_00000000z0000z0000z0000z000000000000 Some Field");
    });

    // Mentions
    test('Mentioning two users', () => {
        const mentions: IDeltaMention[] = [{
            key: 'mention',
            prefix: '_U_',
            postfix: '',
            valueKey: 'id',
        }];
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": {
                    "mention": {
                        "index": "0",
                        "denotationChar": "@",
                        "value": "User 1",
                        "id": "5555"
                    }
                },
            }, {
                "insert": " Please ask "
            },
            {
                "insert": {
                    "mention": {
                        "index": "0",
                        "denotationChar": "@",
                        "value": "User 2",
                        "id": "4444"
                    }
                },
            }, {
                "insert": " to give you the docs",
            }
        ], mentions);

        expect(md).toEqual("_U_5555 Please ask _U_4444 to give you the docs");
    });

    // Customer case
    test('Multiline Inside Blockquote', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                insert: "Google",
                attributes: {
                    link: "https://google.com",
                },
            },
            {
                insert: " ,",
            },
            {
                insert: "\nGoogle 2 ,",
                attributes: {
                    italic: true,
                    link: "https://google.com",
                },
            },
            {
                insert: "\n_[Google 3]https://google.com)\n",
            },
        ]);

        expect(md).toEqual("[Google](https://google.com) ,\n\n_[Google 2 ,](https://google.com)_\n\n_[Google 3]https://google.com)");
    });
});
