/**
 * Created by felix on 11/14/16.
 */

/**
 * 1. Returns for `is*`
 *  - false to indicate not
 *  - non-empty to indicate yes, and the return is the extend information
 *
 * 2. Returns for other than `is*`
 *  - true to go on the default event
 *  - false to prevent the default event
 *  - others to go on extend check
 *
 * 3.
 *  keyword `this` stands for current line, a Node
 *
 * @type {{
 *  isCodeBlock: Extend.isCodeBlock
 *  codeBlock: Extend.codeBlock
 *
 *  isTableBlock: Extend.isTableBlock
 *  tableBlock: Extend.tableBlock
 *
 *  isSeparator: Extend.isSeparator
 *  separator: Extend.separator
 *
 *  isAutoIndent: Extend.isAutoIndent
 *  autoIndent: Extend.autoIndent
 *
 *  isTableCRLF: Extend.isTableCRLF
 * }}
 */
var Extend = {
    /** Code Block */
    isCodeBlock: function () {
        var match = this.getText().match(/^(\s*)`{3,}([^`]*)\s*$/);
        if (!match) return false;
        var info = [match[1]];
        switch (match[2]) {
            case 'js':
            case 'javascript':
                info.push('JavaScript');
                break;
            default:
                info.push(match[2].trim());
                break;
        }
        return info;
    },
    codeBlock: function (info) {
        var line = this;
        // todo: info[1] , "php" to highlight semantically
        console.log('spaces', info[0].length, ';', 'language', info[1]);
        var indent = parseInt(info[0].length / Note.tabLength * 2);
        if (line instanceof Text) line = Note.wrapWithLine(line);
        var cls = 'fc ';
        if (info[1]) cls += 'with-badge ' + info[1];
        line.innerHTML = '<code' + (indent ? ' style="margin-left:' + indent + 'rem"' : '') + ' class="' + cls + '"><ul><li><br></li></ul></code>';
        var code = line.firstChild;
        if (info[1]) { // language badge
            var badge = Note.createElement('div');
            badge.innerText = info[1];
            badge.className = 'code badge';
            code.prepend(badge);
        }
        line.asWrapper();
        Caret.focusAt(code.lastChild, 0);
        return false;
    },
    /**
     *  Table Block
     *  @return {Array|Boolean} [[title, alignment], ...]
     */
    isTableBlock: function () {
        // |x|x|, the table must start and end with "|"
        var match = this.getText().match(/^\s*(?:\|[^\|]+)+\|\s*$/g);
        if (match instanceof Array) {
            var cells = match[0].split('|');
            cells.shift(); // first empty string by "|" in the end
            cells.pop(); // last empty string by "|" in front
            var leftColon, rightColon, length;
            ArrayHelper.each(cells, function (k, c) {
                length = c.length;
                leftColon = c[0] === ':';
                rightColon = c[length - 1] === ':';

                if (leftColon && rightColon) {  // |:title:|
                    cells[k] = [c.substr(1, length - 2)];
                    cells[k].push('center');
                    return true;
                } else if (!leftColon && !rightColon) { // |title|
                    cells[k] = [c];
                    cells[k].push('center')
                } else if (rightColon) { // |title:|
                    cells[k] = [c.substr(0, length - 1)];
                    cells[k].push('right');
                } else { // |:title|
                    cells[k] = [c.substr(1)];
                    cells[k].push('left');
                }
            });
            return cells;
        } else {
            return false;
        }
    },
    /**
     * @param {Array} info [[title, alignment], ...]
     * @returns {boolean}
     */
    tableBlock: function (info) {
        var tag = function () {
            return HtmlHelper.tag.apply(HtmlHelper, arguments);
        };

        var head = '';
        var body = '';
        for (var i = 0; i < info.length; i++) {
            head += tag('th', tag('div', info[i][0]), {align: info[i][1]});
            body += tag('td', tag('div', '<br>'), {align: info[i][1]});
        }

        this.innerHTML = tag('table', tag('thead', tag('tr', head)) + tag('tbody', tag('tr', body)));
        // Make line un-editable, in case characters get in between <div> and <table>
        // <div> out of the table <table> ... </table> </div>
        this.asEditable(false);
        var table = this.firstElementChild;
        // Make the table editable
        table.asEditable(true);
        this.asWrapper();

        var firstTd = table.querySelector('tbody').querySelector('td');
        Caret.focusAt(firstTd, 0);

        return false;
    },
    /** Separator */
    isSeparator: function () {
        var match = this.getText().match(/(?:^-{3,}$)|(?:^={3,}$)/);
        return match ? match[0].substr(0, 1) : false;
    },
    separator: function (type) {
        this.innerHTML = '<div class="fs"></div>';
        this.asEditable(false);
        this.asWrapper();
        FunctionMap.createNewLineBelow2Go();
        return false;
    },
    /** Auto Indent */
    isAutoIndent: function () {
        var match = this.getText().match(/(^ {4,})|(^\t+)/);
        if (!match) return false;
        // Returns how many tabs to indent
        // 1 = 1 tab or 4 spaces
        return parseInt(match[0].length / Note.tabLength);
    },
    autoIndent: function (length) {
        var text = Note.tabString().repeat(length);
        var spaces = document.createTextNode(text);

        if (Caret.inTheBeginning()) {
            return true;
        } else if (Caret.inTheEnd()) {
            var newLine = Note.createEmptyLine(this instanceof Node ? this.nodeName : undefined);
            newLine.prepend(spaces);
            this.after(newLine);
            Caret.focusAt(spaces, text.length);
        } else {
            var range = new Range();
            var sel = window.getSelection();
            range.selectNode(this);
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.insertNode(spaces);
            // Move the DocumentFragment from range to variable
            var fragment = range.extractContents();
            this.after(fragment);
            // The fragment becomes a node after being inserted
            // Since the fragment ends with </li>, it will be automatically prepend <li> after inserted
            Caret.focusAt(this.nextSibling, text.length);
            // Detach for performance reason
            range.detach();
        }
        return false;
    },
    isInTable: function () {
        return Caret.inTableCell();
    },
    inTable: function (cell) {
        // Normalize
        if (Note.normalize(cell)) {
            return false;
        }
        var currentLine = Note.getCurrentLine();
        return Note.extend(currentLine, ['autoIndent', 'codeBlock']);
    }
};
