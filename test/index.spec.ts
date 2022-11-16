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

        expect(md).toBe("**Bold** _Italic_ ~~Strike~~ [Link](http://link.com)");
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

        expect(md).toBe("Head 1\n======\n\nHead 2\n------\n\n### Head 3");
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

        expect(md).toBe("Head 1\n======\n\nNormal text");
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

        expect(md).toBe("* List 1\n\nNormal text");
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

        expect(md).toBe("> Quote\n\n`Code`\n\n    Code Block");
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

        expect(md).toBe("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n        * Level 1 - 1 - 2\n\n    * Level 1 - 2\n\n* Level 2\n\n    * Level 2 - 1\n\n* Level 3\n\n* Level 4");
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

        expect(md).toBe("1. Level 1\n\n    1. Level 1 - 1\n\n        1. Level 1 - 1 - 1\n\n        2. Level 1 - 1 - 2\n\n    2. Level 1 - 2\n\n2. Level 2\n\n    1. Level 2 - 1\n\n3. Level 3\n\n4. Level 4");
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

        expect(md).toBe("1. Ordered 1\n\n    * Bullet 1\n\n    * Bullet 2\n\n1. Ordered 1\n\n2. Ordered 2");
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

        expect(md).toBe("1. Ordered 1\n\n2. Ordered 2\n\n    Code Block");
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

        expect(md).toBe("**Bold** **_Bold & Italic_**");
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

        expect(md).toBe("_~~Italic And Strike~~_");
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

        expect(md).toBe("* **Bold**");
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

        expect(md).toBe("* **Bold** **_Bold & Italic_**");
    });

    test('Empty Lines', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": "Line 1\n\n\nLine 2\n"
            }
        ]);

        expect(md).toBe("Line 1\n\n\n\n\n\nLine 2");
    });

    test('Tabs', () => {
        const md = deltaToMdConverter.deltaToMarkdown([
            {
                "insert": '\t\tWith tabs\n'
            }
        ]);

        expect(md).toBe("\t\tWith tabs");
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

        expect(md).toBe("    Code block 1\n\n    Code block 2");
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

        expect(md).toBe("    Code block 1\n\n\n    Code block 2");
    });
});

describe('Markdown to Delta', () => {
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
});
