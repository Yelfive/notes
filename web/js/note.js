/**
 * Created by felix on 11/12/16.
 */


/**
 *
 * Base methods for Note
 */
var Note = {
    down: {},
    tabLength: 4,
    PARAGRAPH_TYPE: HTMLDivElement,
    _statusKey: function (key) {
        return key.toLowerCase();
    },
    keyDown: function (key) {
        this.down[this._statusKey(key)] = true;
    },
    keyUp: function (key) {
        this.down[this._statusKey(key)] = false;
    },
    isKeyDown: function (key) {
        return this.down[this._statusKey(key)] == true;
    },
    _hashedKeyFunction: null,
    hashKey: function (keys) {
        var sorted = keys.sort();
        ObjectHelper.each(sorted, function (k, v) {
            sorted[k] = v.toLowerCase();
        });
        return sorted.join('-');
    },
    init: function (options) {
        // Set container
        this.container(options.container);
        // Parse map
        this.parseMap(options.keyMap);
        // Insert a initial line
        this.firstLine();

        this.validate();
    },
    firstLine: function () {
        if (this._container.childElementCount) return;
        this._container.innerHTML = this.PARAGRAPH_TYPE == HTMLLIElement ? HtmlHelper.tag('ul', this.createEmptyLine().outerHTML) : this.createEmptyLine().outerHTML;
    },
    /**
     * @param nodeName
     * @returns {Element}
     */
    createEmptyLine: function (nodeName) {
        if (!nodeName) nodeName = this.PARAGRAPH_TYPE == HTMLDivElement ? 'div' : 'li';
        var node = document.createElement(nodeName);
        node.appendChild(document.createElement('br'));
        return node;
    },
    parseMap: function (map) {
        var self = this;
        self._hashedKeyFunction = {};
        ObjectHelper.each(map, function (k, v) {
            if (v.keys instanceof Array) {
                self._hashedKeyFunction[self.hashKey(v.keys)] = {action: v.action, description: v.description};
            } else {
                throw new Error('Key map should contain an array value for key called "keys"');
            }
        });
    },
    /**
     * Change the case
     */
    changeCase: function (toLowerCase) {
        var sel = window.getSelection();
        if (sel.isCollapsed) {
            return false;
        }

        /* Make sure the natural order of the selection: begin from left and end in right */
        var begin, end, beginOffset, endOffset;
        if (sel.anchorNode == sel.focusNode
            || sel.containsNode(nextNode(sel.anchorNode), true)
        ) {
            begin = sel.anchorNode;
            end = sel.focusNode;
            beginOffset = sel.anchorOffset;
            endOffset = sel.focusOffset;
            if (begin == end && beginOffset > endOffset) { // exchange offsets
                beginOffset += endOffset;
                endOffset = beginOffset - endOffset;
                beginOffset = beginOffset - endOffset;
            }
        } else {
            begin = sel.focusNode;
            end = sel.anchorNode;
            beginOffset = sel.focusOffset;
            endOffset = sel.anchorOffset;
        }

        /**
         *
         * @param {Node} node
         * @param-internal {int} start Position of
         * @param-internal {int} end
         */
        function _changeCase(node) {
            var text = node.textContent;
            var start = arguments[1];
            var end = arguments[2];
            if (start === undefined) start = 0;
            if (end === undefined) end = text.length;

            var prepend = text.substring(0, start);
            var append = text.substring(end, text.length);
            var body = text.substring(start, end);
            body = toLowerCase ? body.toLowerCase() : body.toUpperCase();
            node.textContent = prepend + body + append;
        }

        /**
         *
         * @param {Node} node
         */
        function nextNode(node) {
            var next = node.nextSibling;

            return next ? next : nextNode(node.parentNode);
        }

        // todo Case 0: collapsed
        // Case 1: begin=end
        if (begin == end) {
            var anchorOffset = sel.anchorOffset;
            var focusOffset = sel.focusOffset;
            var startPos = Math.min(anchorOffset, focusOffset);
            var endPos = anchorOffset + focusOffset - startPos;
            _changeCase(begin, startPos, endPos);
        }
        // Case 2: begin < end
        else {
            _changeCase(begin, beginOffset);
            var current = nextNode(begin);
            while (current && !current.contains(end)) {
                _changeCase(current);
                current = current.nextSibling;
            }
            _changeCase(end, 0, endOffset);
        }
        this.setSelected(begin, beginOffset, end, endOffset);
    },
    setCaret: function (node, offset) {
        var selection = window.getSelection();
        var range = new Range();
        // set the caret
        selection.removeAllRanges();
        range.setStart(node, offset);
        // range.setEnd(tabNode, tabString.length); // this will select from current to new range end point(tabNode content)
        selection.addRange(range);
    },
    setSelected: function (begin, beginOffset, end, endOffset) {
        var sel = getSelection();
        sel.removeAllRanges();
        var range = new window.Range();
        range.setStart(begin, beginOffset);
        range.setEnd(end, endOffset);
        sel.addRange(range);
    },
    invokedKeys: [],
    invoke: function (event) {
        if (null == this._hashedKeyFunction) throw new Error('Map should be parsed first.');

        var key = Code2Key[event.keyCode];
        if (key) {
            this.keyDown(key);
        } else {
            if (console) console.log('"' + event.keyCode + '":', '"' + event.key.replace(/^[a-z]/, function (v) {
                    return v.toUpperCase()
                }) + '"');
            return true;
        }

        // Retrieve pressed keys
        this.invokedKeys = [];
        for (var p in this.down) {
            if (this.down[p]) {
                this.invokedKeys.push(p);
            }
        }

        var map = this.invokedKeys.length ? this._hashedKeyFunction[this.hashKey(this.invokedKeys)] : null;
        if (!map) {
            if (console && console.info) console.info('No action bound with: ' + this.invokedKeys.join('-'));
            return true;
        }

        var action = FunctionMap[map.action];

        if (action && action instanceof Function) {
            return action.call(FunctionMap);
        }
        return true;
    },
    revoke: function () {
        this.down = {};
        this.invokedKeys = [];
    },
    /**
     * @param {null|HTMLElement}
     */
    _container: null,
    /**
     * Set the container for the editor
     * @param {String|HTMLElement} selector
     * @returns {Note}
     */
    container: function (selector) {
        switch (selector[0]) {
            case '#':
                this._container = document.getElementById(selector.substr(1));
        }
        return this;
    },
    /**
     * Check if necessary configure is set
     */
    validate: function () {
        if (!this._container) throw new Error('Call Note.container(selector) to set the container for the editor.');
    },
    /**
     * Find first block parent element
     * - todo if param is given, the param should be instance of Node, and the first block contains that node will be returned
     * - if no param given, first block contains current caret will be returned
     * @param-internal {Node} node
     * @returns {Node|Null}
     */
    getCurrentLine: function () {
        var sel = window.getSelection();
        var line = sel.anchorNode;

        while (line && line != this._container) {
            if (line.isLine()) return line;
            line = line.parentNode;
        }
        return null;
    },
    /**
     * Canonicalize given line into into formal Note.PARAGRAPH_TYPE line
     * and returns it
     * This is used when press 'Enter' in pasted lines, and the format is not supposed
     * @param {HTMLElement} line
     * @returns {Node}
     */
    canonicalize: function (line) {
        if (!(line instanceof this.PARAGRAPH_TYPE)) { // change into a PARAGRAPH_TYPE node
            var newLine = this.createEmptyLine();
            // newLine.innerHTML = line.innerHTML;
            // var sel = window.getSelection();
            var range = new Range();
            range.setEnd(line, 0);
            range.insertNode(newLine);
            newLine.appendChild(line);
            // line.parentNode.removeChild(line);
            line = newLine;
        } else if (/^\s*$/.test(line.innerHTML)) { //

        }
        return line;
    },
    /**
     * Check if the last line is empty line, otherwise, create new line
     * This makes sure there always is an empty line at the end of the note
     */
    ensureLastLineEmpty: function () {
        var lastLine = this._container.lastChild ? this._container.lastChild.lastChild : this._container.lastChild;
        if (!lastLine.isEmpty()) lastLine.after(this.createEmptyLine());
    }
};

ObjectHelper.each({
    /**
     * @return {boolean} Indicates if the line is empty
     */
    isEmpty: function () {
        var children = this.childNodes;
        return children.length === 1 && (children[0].nodeName === 'BR' || /^\s*$/.test(children[0].innerText))
    },
    /**
     *  Line elements:
     *  - p
     *  - div
     *  - li
     * @returns {boolean}
     */
    isLine: function () {
        return ArrayHelper.in(this.nodeName, ['P', 'DIV', 'LI']);
    },
    /**
     * Return information about code block, if it is a code block
     * @returns {Array|Boolean}
     */
    isCodeBlock: function () {
        var match = this.innerText.match(/^(\s*)`{3}(\w*)\s*$/);
        return match == null ? false : [match[1], match[2]];
    },
    isTableBlock: function () {
        // |x|x|, the table must start and end with "|"
        var match = this.innerHTML.match(/^\s*(?:\|[^\|]+)+\|\s*$/g);
        if (match instanceof Array) {
            var cells = match[0].split('|');
            cells.shift();
            cells.pop();
            return cells;
        } else {
            return false;
        }
    },
    isExtensible: function () {
        var sel = window.getSelection();
        if (!sel.isCollapsed) return false;
        /*
         * 1. current line contains only text
         * 2. current line contains text and tags with no text (this is text<br>)
         *
         * And for both of the situations, they match innerText.length=selection.offset
         * ```html
         * This is <b>strong text</b>
         * ```
         * When the caret is in the end
         * - `offset=0`     (offset starts from </b>)
         * - `innerText.length=19`
         * So they won't match, and that won't be considered as extensible
         */
        var range = new Range();
        // Set the range contains the whole line
        range.selectNodeContents(this);
        // Set the start position for the range, to minimize the range
        // This range starts from selected anchor and offset, ends at the end of the line
        range.setStart(sel.anchorNode, sel.anchorOffset);
        // Check if the range contains anything
        return range.cloneContents().textContent.length == 0;
    }
}, function (k, v) {
    Node.prototype[k] = v;
});