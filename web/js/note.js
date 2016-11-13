/**
 * Created by felix on 11/12/16.
 */


/**
 *
 * Base methods for Note
 * @type {{down: {}, _statusKey: Note._statusKey, keyDown: Note.keyDown, keyUp: Note.keyUp, isKeyDown: Note.isKeyDown, _hashedKeyFunction: null, hashKey: Note.hashKey, parse: Note.parse, changeCase: Note.changeCase, setCaret: Note.setCaret, setSelected: Note.setSelected, invoke: Note.invoke, revoke: Note.revoke}}
 */
var Note = {
    down: {},
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
    parse: function (map) {
        var self = this;
        self._hashedKeyFunction = {};
        ObjectHelper.each(map, function (k, v) {
            if (v.keys instanceof Array) {
                self._hashedKeyFunction[self.hashKey(v.keys)] = {action: v.action, description: v.description};
            } else {
                throw new Error('Key map should contain an array value for key called "keys"');
            }
        });
        return self;
    },
    changeCase: function () {

        var toLowerCase = this.isKeyDown('l');
        var sel = window.getSelection();

        /* Make sure the natural order of the selection: begin from left and end in right */
        var begin, end, beginOffset, endOffset;
        // console.log(sel.anchorNode, sel.anchorNode.nextSibling)
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
        function changeCase(node) {
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
            changeCase(begin, startPos, endPos);
        }
        // Case 2: begin < end
        else {
            changeCase(begin, beginOffset);
            var current = nextNode(begin);
            while (current && !current.contains(end)) {
                changeCase(current);
                current = current.nextSibling;
            }
            changeCase(end, 0, endOffset);
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
            return action.call(Key2Function);
        }
        return true;
    },
    revoke: function (event) {
        var self = this;
        ObjectHelper.each(this.invokedKeys, function (index, key) {
            self.keyUp(key);
        });
        self.invokedKeys = [];
    }
};