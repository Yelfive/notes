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
    tabString: function () {
        return ' '.repeat(this.tabLength);
    },
    PARAGRAPH_TYPE: HTMLDivElement,
    _statusKey: function (key) {
        return key;
    },
    keyDown: function (key) {
        key = this.codeAliases[key] || key;
        this.down[this._statusKey(key)] = true;
    },
    keyUp: function (key) {
        key = this.codeAliases[key] || key;
        this.down[this._statusKey(key)] = false;
    },
    isKeyDown: function (key) {
        return this.down[this._statusKey(key)] == true;
    },
    /**
     * code => alias
     */
    codeAliases: (function () {
        var map = {};
        map[CODE.ARROW_LEFT] = CODE.ARROW;
        map[CODE.ARROW_UP] = CODE.ARROW;
        map[CODE.ARROW_RIGHT] = CODE.ARROW;
        map[CODE.ARROW_DOWN] = CODE.ARROW;
        return map;
    })(),
    _hashedKeyFunction: null,
    hashKey: function (keys) {
        return keys.sort().join('-');
    },
    init: function (options) {
        // Set container
        this.container(options.container);
        // Parse function map
        this.parseHotKeys(options.keyMap);
        // Insert a initial line
        this.firstLine();
        // Check if necessary configure is set
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
        if (!nodeName || nodeName === '#text') nodeName = this.PARAGRAPH_TYPE == HTMLDivElement ? 'div' : 'li';

        var node = document.createElement(nodeName);
        node.appendChild(document.createElement('br'));
        return node;
    },
    parseHotKeys: function (map) {
        var self = this;
        self._hashedKeyFunction = {};
        ObjectHelper.each(map, function (k, v) {
            if (v.keys instanceof Array) {
                self._hashedKeyFunction[self.hashKey(v.code)] = {
                    keys: v.keys,
                    action: v.action,
                    description: v.description
                };
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
    wrapWithLine: function (text) {
        if (text instanceof Node) {
            var wrap = this.createEmptyLine();
            var range = new Range();
            range.selectNode(text);
            range.surroundContents(wrap);
            return wrap;
        }
    },
    findLastChildTextNode: function (node) {
        var child = node;
        if (child instanceof Text) return child;

        return this.findLastChildTextNode(child.lastChild);
    },
    /**
     * - node is Text
     *      Set caret at the Text's given offset
     * - node is Element
     *      Set caret at the first Text child's given offset
     * @param {Node} node
     * @param {int} offset The offset of the Text Node
     */
    setCaret: function (node, offset) {
        var selection = window.getSelection();
        var range = new Range();
        var start;
        if (offset < 0) { // place the caret at the end of the node
            start = this.findLastChildTextNode(node);
            offset = start.textContent.length;
        } else {
            start = node.firstChild ? node.firstChild : node;
        }
        // set the caret
        selection.removeAllRanges();
        node.normalize(); // To merge adjacent, remove empty
        range.setStart(start, offset);
        selection.addRange(range);
    },
    setSelected: function (begin, beginOffset, end, endOffset) {
        var sel = getSelection();
        var range = new window.Range();
        range.setStart(begin, beginOffset);
        range.setEnd(end, endOffset);
        /*
         * 1: `begin` is the same as `end`, but beginOffset > endOffset
         * 2: `end` is ahead of `begin`
         */
        if (range.collapsed) {
            range.setStart(end, endOffset);
            range.setEnd(begin, beginOffset);
        }
        sel.removeAllRanges();
        sel.addRange(range);
        range.detach();
    },
    createTabNode: function () {
        var tabString = Note.tabString();
        return document.createTextNode(tabString);
    },
    fnKeys: [CODE.ALT, CODE.CONTROL, CODE.SHIFT],
    isCommonKey: function (code) {
        return !ArrayHelper.in(code, this.fnKeys) && !ArrayHelper.in(code, [
                CODE.ENTER, CODE.BACKSPACE, CODE.TAB, CODE.BACK_QUOTE,
                CODE.ARROW_LEFT, CODE.ARROW_UP, CODE.ARROW_RIGHT, CODE.ARROW_DOWN
            ]);
    },
    isCharacterKey: function (code) {
        return code >= CODE.A && code <= CODE.Z;
    },
    sinceFunctionalKeyDown: function () {
        var down = false;
        ObjectHelper.each(this.fnKeys, function (k, v) {
            if (Note.isKeyDown(v)) {
                down = true;
                return false;
            }
        });
        return down;
    },
    /**
     * In lower case
     * ['enter', 'shift', 'b']
     */
    invokedKeys: [],
    invoke: function (event) {
        // if (++UndoManager.keyDownCount > UndoManager.keyDownInterval && this.invokedKeys.length === 0) {
        // UndoManager.keyDownCount = 0;
        // UndoManager.overwrite(event);
        // }
        // // 229: type with chinese input, [a-z] and space will trigger event with code 229
        // if (ArrayHelper.in(event.keyCode, [229])) {
        //     return true;
        // }
        try {
            var code = event.keyCode;
            // TODO:
            // Key of "Meta" on Mac will result problem
            // `Meta + B` will not trigger B keyup when up, e.t.c
            if (code == CODE.META_LEFT || code == CODE.META_RIGHT) {
                return false;
            }
            if (
                this.isCommonKey(code) && (this.isKeyDown(CODE.SHIFT) || !this.sinceFunctionalKeyDown())
                || code == CODE.BACKSPACE
            ) {
                UndoManager.overwrite(code);
                return true;
            }
            // if common key is pressed, but no functional key is, then, do some UndoManager.rewrite thing
            /*
             if (this.isCommonKey(code) && (this.isKeyDown(CODE.SHIFT) || !this.sinceFunctionalKeyDown())) {
             // 1. write in content box
             // 2. UndoManager.overwrite
             return true;
             var key = Code2Key[code];
             if (!key) {
             // todo: problem, cannot tell exactly when a punctuation is typed, what language the punctuation is in
             // todo: such as, difference between chinese and english period
             console.error('No key found in Code2Key, code', code, 'event.key:', "'" + event.key + "'");
             return true;
             } else if (!this.isKeyDown(CODE.SHIFT)) {
             key = key.toLowerCase();
             document.execCommand('insertText', false, key);
             }
             return false;
             }
             */
            if (code) {
                this.keyDown(code);
            } else {
                if (console) console.log('"' + event.keyCode + '":', '"' + event.key.ucfirst() + '"');
                return true;
            }

            // Retrieve pressed keys
            this.invokedKeys = [];
            for (var p in this.down) {
                if (this.down[p]) {
                    this.invokedKeys.push(parseInt(p));
                }
            }

            var map = this.invokedKeys.length ? this._hashedKeyFunction[this.hashKey(this.invokedKeys)] : null;
            if (!map) {
                if (console && console.info) {
                    (function () {
                        var _ = [];
                        for (var i in Note.invokedKeys) {
                            _.push(Code2Key[Note.invokedKeys[i]] || Note.invokedKeys[i]);
                        }
                        _.sort(function (v1, v2) {
                            var fn = ['Control', 'Alt', 'Shift'];
                            if (ArrayHelper.in(v1, fn)) {
                                return -1;
                            } else if (ArrayHelper.in(v2, fn)) {
                                return 1;
                            }
                        });
                        console.info('No action bound with: ' + _.join(' + '));
                    })();
                }
                return true;
            }

            var action = FunctionMap[map.action];

            if (action && action instanceof Function) {
                var performDefault = action.call(FunctionMap, event);
                /*
                 * action -> afterAction
                 */
                var afterAction = FunctionMap['after' + map.action.ucfirst()];
                if (afterAction && afterAction instanceof Function) afterAction.call(FunctionMap);
                if (!performDefault) event.preventDefault();
            }
            return true;
        } catch (e) {
            // revoke all when exception occurs
            this.revoke({keyCode: CODE.META_LEFT});
            throw e;
        }
    },
    revoke: function (event) {
        var self = this;

        var currentCode = event.keyCode;

        currentCode = this.codeAliases[currentCode] || currentCode;

        if (currentCode == CODE.META_LEFT || currentCode == CODE.META_RIGHT) {
            self.down = {};
            self.invokedKeys = [];
            return false;
        }
        ObjectHelper.each(this.invokedKeys, function (index, key) {
            if (key == currentCode) {
                self.keyUp(key);
                self.invokedKeys.splice(index, 1);
            }
        });
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
        // Set UndoManager container
        UndoManager.init({transact: true, container: this._container});
        return this;
    },
    /**
     * Check if necessary configure is set
     */
    validate: function () {
        if (!this._container) throw new Error('Call Note.container(selector) to set the container for the editor.');
        if (null == this._hashedKeyFunction) throw new Error('Map should be parsed first.');
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

        // while (line && this._container.contains(line)) {
        while (line && line != this._container) {
            if (line.isLine()) return line;
            line = line.parentNode;
        }
        if (sel.anchorNode instanceof Text) {
            return sel.anchorNode;
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
        var container = this._container;
        var lastLine = container.lastChild;
        var tagName;
        if (lastLine instanceof HTMLUListElement) {
            container = lastLine;
            lastLine = container.lastChild;
            tagName = 'LI';
        } else {
            tagName = 'div';
        }
        if (!lastLine || !lastLine.isEmpty()) {
            container.appendChild(this.createEmptyLine(tagName));
        }
    },
    extend: function (line, validations) {
        var validationMethod, result, info;
        var goOn = true;
        ObjectHelper.each(validations, function (k, v) {
            validationMethod = 'is' + v.ucfirst();
            if (Extend[validationMethod] instanceof Function) {
                info = Extend[validationMethod].call(line);
                if (!info) return true;
                console.info('Perform extend for ' + v, 'with info: ', info);
                if (!Extend[v]) {
                    console.error('No Extend for ' + v + '. You should have a method called such in class Extend');
                    return true;
                }
                result = Extend[v].apply(line, [info]);
                if (null !== result) {
                    goOn = result;
                    return false; // break the iteration
                }
            } else {
                console.error('No validation method ' + validationMethod + '. You should declare a method called such in class Extend')
            }
        });
        return goOn;
    },
    /**
     * @param {HTMLTableCellElement} cell
     * @returns {Boolean|HTMLTableCellElement|Node}
     */
    findPreviousCell: function (cell) {
        // Try previous cell <td>
        var node = cell.previousElementSibling;
        if (node) return node;

        // Try last cell of previous row <tr>;
        var currentRow = cell.parentNode;
        var previousRow = currentRow.previousElementSibling;
        if (previousRow) return previousRow.lastElementChild;

        // No previous row found
        // Check if a head row exists(current row belongs table body)
        var currentTablePart = currentRow.parentNode;
        var previousTablePart;
        switch (currentTablePart.nodeName) {
            case 'TFOOT':
                previousTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If the table body does not exist, try get the head instead
                if (previousTablePart) break;
            case 'TBODY':
                previousTablePart = currentTablePart.parentNode.getElementsByTagName('thead')[0];
                break;
            default:
                return false;
        }
        if (!previousTablePart) return false;

        previousRow = previousTablePart.lastElementChild;

        return previousRow ? previousRow.lastElementChild : false;

    },
    /**
     * @param {HTMLTableCellElement} cell
     * @returns {Boolean|HTMLTableCellElement|Node}
     */
    findNextCell: function (cell) {
        // Try previous cell <td>
        var node = cell.nextElementSibling;
        if (node) return node;

        // Try last cell of previous row <tr>;
        var currentRow = cell.parentNode;
        var nextRow = currentRow.nextElementSibling;
        if (nextRow) return nextRow.firstElementChild;

        // No previous row found
        // Check if a head row exists(current row belongs table body)
        var currentTablePart = currentRow.parentNode;
        var previousTablePart;
        switch (currentTablePart.nodeName) {
            case 'THEAD':
                previousTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If the table body does not exist, try get the head instead
                if (previousTablePart) break;
            case 'TBODY':
                previousTablePart = currentTablePart.parentNode.getElementsByTagName('tfoot')[0];
                break;
            default:
                return false;
        }
        if (!previousTablePart) return false;

        nextRow = previousTablePart.firstElementChild;

        return nextRow ? nextRow.firstElementChild : false;
    },
    findSiblingCell: function (cell, direction) {
        var sibling, child;
        switch (direction) {
            case 'next':
                sibling = 'nextElementSibling';
                child = 'firstElementChild';
                break;
            case 'prev':
                sibling = 'previousElementSibling';
                child = 'lastElementChild';
                break;
            default:
                throw new Error('Parameter direction should be either next or prev');
        }
        // Try previous cell <td>
        var node = cell[sibling];
        if (node) return node;

        // Try last cell of previous row <tr>;
        var currentRow = cell.parentNode;
        var siblingRow = currentRow[sibling];
        if (siblingRow) return siblingRow[child];

        // No previous row found
        // Check if a head row exists(current row belongs table body)
        var currentTablePart = currentRow.parentNode;
        var siblingTablePart = false;
        switch (currentTablePart.nodeName) {
            case 'THEAD':
                if (direction == 'prev') return false;
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                if (siblingTablePart) break;
            case 'TFOOT':
                if (siblingTablePart !== false) break;
                if (direction == 'next') return false;
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If the table body does not exist, try get the head instead
                if (siblingTablePart) break;
            case 'TBODY':
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName(direction == 'prev' ? 'thead' : 'tfoot')[0];
                break;
            default:
                return false;
        }
        if (!siblingTablePart) return false;

        siblingRow = siblingTablePart[child];

        return siblingRow ? siblingRow[child] : false;
    }
};

ObjectHelper.each({
    /**
     * @return {boolean} Indicates if the line is empty
     */
    isEmpty: function () {
        if (this instanceof Text) {
            return this.textContent.length === 0;
        }
        var children = this.childNodes;
        if (children.length === 0) {
            return true;
        }
        if (children.length === 1 && children[0].nodeName === 'BR') {
            return true;
        }
        return false;
        // return children.length === 0 || children.length === 1 && (children[0].nodeName === 'BR' || /^\s*$/.test(children[0].innerText))
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
    isStrictLine: function () {
        return this.parentNode === this._container;
    },
    getText: function () {
        if (this instanceof Text) return this.textContent;
        if (this instanceof Element) return this.innerText;
    },
    getHTML: function () {
        if (this instanceof Text) return this.textContent;
        if (this instanceof Element) return this.innerHTML;
    },
    isExtensible: function () {
        var sel = window.getSelection();
        if (!sel.isCollapsed) return false;

        return true;
        // var length = Extend.isAutoIndent.apply(Note.getCurrentLine());
        // if (length) return true;
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

ObjectHelper.each({
    ucfirst: function () {
        return this.replace(/^\w/, function (word) {
            return word.toUpperCase();
        })
    }
}, function (k, v) {
    String.prototype[k] = v;
});