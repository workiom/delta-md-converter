import mdToHtmlConverter from '../src/index'
import { IStringMention } from '../src/markdown-to-nodes';

describe('Delta to HTML', () => {
    test('Bold, Italic, Strike and Link', () => {
        const html = mdToHtmlConverter.markdownToHtml("**Bold** _Italic_ ~~Strike~~ [Link](http://link.com)");

        expect(html).toEqual("<b>Bold</b> <i>Italic</i> <s>Strike</s> <a href=\"http://link.com\" target=\"_blank\">Link</a>");
    });

    test('Heading', () => {
        const html = mdToHtmlConverter.markdownToHtml("Head 1\n======\n\nHead 2\n------\n\n### Head 3");

        expect(html).toEqual("<h1>Head 1</h1><h2>Head 2</h2><h3>Head 3</h3>");
    });

    test('Text after header', () => {
        const html = mdToHtmlConverter.markdownToHtml("Head 1\n======\n\nNormal text");

        expect(html).toEqual("<h1>Head 1</h1>Normal text");
    });

    test('Text after list', () => {
        const html = mdToHtmlConverter.markdownToHtml("* List 1\n\nNormal text");

        expect(html).toEqual("<ul><li>List 1</li></ul><br>Normal text");
    });

    test('Quote, Code And Code block', () => {
        const html = mdToHtmlConverter.markdownToHtml("> Quote\n\n`Code`\n\n    Code Block");

        expect(html).toEqual("<blockquote>Quote</blockquote><code>Code</code><br><pre>Code Block</pre>");
    });

    test('Bullet List', () => {
        const html = mdToHtmlConverter.markdownToHtml("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n        * Level 1 - 1 - 2\n\n    * Level 1 - 2\n\n* Level 2\n\n    * Level 2 - 1\n\n* Level 3\n\n* Level 4");

        expect(html).toEqual("<ul><li>Level 1<ul><li>Level 1 - 1<ul><li>Level 1 - 1 - 1</li><li>Level 1 - 1 - 2</li></ul></li><li>Level 1 - 2</li></ul></li><li>Level 2<ul><li>Level 2 - 1</li></ul></li><li>Level 3</li><li>Level 4</li></ul>");
    });

    test('Multiple Bullet List', () => {
        const html = mdToHtmlConverter.markdownToHtml("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n");

        expect(html).toEqual("<ul><li>Level 1<ul><li>Level 1 - 1<ul><li>Level 1 - 1 - 1</li></ul></li></ul></li></ul>");
    });

    test('Four level of Bullet List', () => {
        const html = mdToHtmlConverter.markdownToHtml("* Level 1\n\n    * Level 1 - 1\n\n        * Level 1 - 1 - 1\n\n            *  Level 1 - 1 - 1 - 1\n\n");

        expect(html).toEqual("<ul><li>Level 1<ul><li>Level 1 - 1<ul><li>Level 1 - 1 - 1<ul><li> Level 1 - 1 - 1 - 1</li></ul></li></ul></li></ul></li></ul>");
    });

    test('Ordered List', () => {
        const html = mdToHtmlConverter.markdownToHtml("1. Level 1\n\n    1. Level 1 - 1\n\n        1. Level 1 - 1 - 1\n\n        2. Level 1 - 1 - 2\n\n    2. Level 1 - 2\n\n2. Level 2\n\n    1. Level 2 - 1\n\n3. Level 3\n\n4. Level 4");

        expect(html).toEqual("<ol><li>Level 1<ol><li>Level 1 - 1<ol><li>Level 1 - 1 - 1</li><li>Level 1 - 1 - 2</li></ol></li><li>Level 1 - 2</li></ol></li><li>Level 2<ol><li>Level 2 - 1</li></ol></li><li>Level 3</li><li>Level 4</li></ol>");
    });

    test('Ordered And Bullet List', () => {
        const html = mdToHtmlConverter.markdownToHtml("1. Ordered 1\n\n    * Bullet 1\n\n    * Bullet 2\n\n2. Ordered 2\n\n3. Ordered 3");

        expect(html).toEqual("<ol><li>Ordered 1<ul><li>Bullet 1</li><li>Bullet 2</li></ul></li><li>Ordered 2</li><li>Ordered 3</li></ol>");
    });

    // test('Multiple Bullet and Ordered List', () => {
    //     const html = mdToHtmlConverter.markdownToHtml("* List 1\n\n    1. Ordered 1\n\n        * List 1 - 1\n\n            1. Ordered 1 - 1\n\n");

    //     expect(html).toEqual("<ul><li>List 1<ol><li>Ordered 1<ul><li>List 1 - 1<ol><li>Ordered 1 - 1</li></ol></li></ul></li></ol></li></ul>");
    // });

    test('Code Block After List', () => {
        const html = mdToHtmlConverter.markdownToHtml("1. Ordered 1\n\n2. Ordered 2\n\n    Code Block");

        expect(html).toEqual("<ol><li>Ordered 1</li><li>Ordered 2</li></ol><pre>Code Block</pre>");
    });

    test('Combine Bold And Italic', () => {
        const html = mdToHtmlConverter.markdownToHtml("**Bold** **_Bold & Italic_**");

        expect(html).toEqual("<b>Bold</b> <b><i>Bold & Italic</i></b>");
    });

    test('Combine Italic And Strike', () => {
        const html = mdToHtmlConverter.markdownToHtml("_~~Italic And Strike~~_");

        expect(html).toEqual("<i><s>Italic And Strike</s></i>");
    });

    test('Bold Inside List', () => {
        const html = mdToHtmlConverter.markdownToHtml("* **Bold**");

        expect(html).toEqual("<ul><li><b>Bold</b></li></ul>");
    });

    test('Bold & Italic Inside List', () => {
        const html = mdToHtmlConverter.markdownToHtml("* **Bold** **_Bold & Italic_**");

        expect(html).toEqual("<ul><li><b>Bold</b> <b><i>Bold & Italic</i></b></li></ul>");
    });

    test('Link With Underscore', () => {
        const html = mdToHtmlConverter.markdownToHtml("[Link with underscore](http://link_with_underscore.com)");

        expect(html).toEqual("<a href=\"http://link_with_underscore.com\" target=\"_blank\">Link with underscore</a>");
    });

    test('Empty Lines', () => {
        const html = mdToHtmlConverter.markdownToHtml("Line 1\n\n\n\n\n\nLine 2");

        expect(html).toEqual("Line 1<br><br><br>Line 2");
    });

    test('Tabs', () => {
        const html = mdToHtmlConverter.markdownToHtml("\t\tWith tabs");

        expect(html).toEqual("\t\tWith tabs");
    });

    test('Multiline Code Block', () => {
        const html = mdToHtmlConverter.markdownToHtml("    Code block 1\n\n    Code block 2");

        expect(html).toEqual("<pre>Code block 1</pre><pre>Code block 2</pre>");
    });

    test('Multiline Inside Code Block', () => {
        const html = mdToHtmlConverter.markdownToHtml("    Code block 1\n\n\n    Code block 2");

        expect(html).toEqual("<pre>Code block 1</pre><br><pre>Code block 2</pre>");
    });

    test('Multiline Blockquote', () => {
        const html = mdToHtmlConverter.markdownToHtml("> Blockquote 1\n\n> Blockquote 2");

        expect(html).toEqual("<blockquote>Blockquote 1</blockquote><blockquote>Blockquote 2</blockquote>");
    });

    // test('Multiline Inside Blockquote', () => {
    //     const html = mdToHtmlConverter.markdownToHtml("> Blockquote 1\n\n\n> Blockquote 2");

    //     expect(html).toEqual("<blockquote>Blockquote 1</blockquote><br><blockquote>Blockquote 2</blockquote>");
    // });

    test('Complex link', () => {
        const html = mdToHtmlConverter.markdownToHtml("[Complex Link](http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query)\n\n[Google Map Link](https://www.google.com/maps/dir/33.5051595,36.3103176/33.5043544,36.3131017/@33.5047211,36.312464,19z/data=!3m1!4b1!4m2!4m1!3e0?hl=ar)");

        expect(html).toEqual("<a href=\"http://link.com/some+(link_with_brackets)+and-continue?id=1&artical=24#Query\" target=\"_blank\">Complex Link</a><br><a href=\"https://www.google.com/maps/dir/33.5051595,36.3103176/33.5043544,36.3131017/@33.5047211,36.312464,19z/data=!3m1!4b1!4m2!4m1!3e0?hl=ar\" target=\"_blank\">Google Map Link</a>");
    });

    // Mentions And Fields
    test('Mention and Fields User', () => {
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
        }, {
            type: 'field',
            reg: /_F_([0-9]+_A_[0-9a-zA-Z]+)/gi,
            denotationChar: '',
            values: [{
                label: 'Field Name',
                value: '123456_A_00000000z0000z0000z0000z000000000000'
            }]
        }];
        const html = mdToHtmlConverter.markdownToHtml("_U_1234 _F_123456_A_00000000z0000z0000z0000z000000000000 Some Field", mentions);

        expect(html).toEqual("<span class=\"mention-item mention-type\">@User Name</span> <span class=\"mention-item field-type\">Field Name</span> Some Field");
    });

    // Mentions
    test('Mentioning two users', () => {
        const mentions: IStringMention[] = [{
            type: 'mention',
            reg: /_U_([0-9]+)/gi,
            denotationChar: '@',
            values: [{
                label: 'User 1',
                value: '5555'
            }, {
                label: 'User 2',
                value: '4444'
            }]
        }];
        const html = mdToHtmlConverter.markdownToHtml("_U_5555 Please ask _U_4444 to give you the docs", mentions);

        expect(html).toEqual("<span class=\"mention-item mention-type\">@User 1</span> Please ask <span class=\"mention-item mention-type\">@User 2</span> to give you the docs");
    });

    // Customer case
    test('Multiline Inside Blockquote', () => {
        const html = mdToHtmlConverter.markdownToHtml("[Google](https://google.com) ,\n\n_[Google 2 ,](https://google.com)_\n\n_[Google 3](https://google.com)");

        expect(html).toEqual("<a href=\"https://google.com\" target=\"_blank\">Google</a> ,<br>_<a href=\"https://google.com\" target=\"_blank\">Google 2 ,</a><i><br></i><a href=\"https://google.com\" target=\"_blank\">Google 3</a>");
    });
});
