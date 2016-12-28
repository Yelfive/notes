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

        var node = Note.createElement(nodeName);
        node.appendChild(Note.createElement('br'));
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
        Caret.setSelected(begin, beginOffset, end, endOffset);
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
    createTabNode: function () {
        var tabString = Note.tabString();
        return document.createTextNode(tabString);
    },
    fnKeys: [CODE.ALT, CODE.CONTROL, CODE.SHIFT],
    isCharacterKey: function (code) {
        return code >= CODE.A && code <= CODE.Z // z-z
            || code >= CODE.ZERO && code <= CODE.NINE // 0-9
            || code >= CODE.SEMICOLON && code <= CODE.BACK_QUOTE // ;=,-./`
            || code >= CODE.BRACKET_LEFT && code <= CODE.QUOTE; // [\]'
    },
    /**
     * In lower case
     * ['enter', 'shift', 'b']
     */
    invokedKeys: [],
    invoke: function (event) {
        try {
            var code = event.keyCode;
            // TODO:
            // Key of "Meta" on Mac will result problem
            // `Meta + B` will not trigger B keyup when up, e.t.c
            if (code == CODE.META_LEFT || code == CODE.META_RIGHT) {
                return false;
            }
            // if common key is pressed, but no functional key is, then, do some UndoManager.rewrite thing
            if (UndoManager.overwrite(code)) return true;

            // maximum key code available,
            // in case codes like 229(press every key with Chinese input) pressed
            if (code <= CODE.QUOTE) {
                this.keyDown(code);
            } else {
                if (console) console.log('"' + event.keyCode + '":', '"' + event.key.ucfirst() + '"');
                return true;
            }

            // Retrieve pressed keys
            this.invokedKeys = [];
            ObjectHelper.each(this.down, function (k) {
                if (Note.down[k]) Note.invokedKeys.push(parseInt(k));
            });

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
                console.info('Performing action', map.action);
                UndoManager.transactOnChange();
                var performDefault = action.call(FunctionMap, event);
                UndoManager.transactOnChange();
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
            console.error(e);
            return false;
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
     * - if param is given, the param should be instance of Node, and the first block contains that node will be returned
     * - if no param given, first block contains current caret will be returned
     * @param-internal {Node} node
     * @returns {Node|Null}
     */
    getCurrentLine: function (node) {
        var sel = window.getSelection();
        var line = node || sel.focusNode;

        // while (line && this._container.contains(line)) {
        while (line && line != this._container) {
            if (line.isLine()) return line;
            line = line.parentNode;
        }
        if (sel.focusNode instanceof Text) {
            return sel.focusNode;
        }
        return null;
    },
    getCurrentLineStrictly: function (node) {
        var sel = window.getSelection();
        var line = node || sel.focusNode;
        var _p;
        while (line && line !== this._container) {
            _p = line.parentNode;
            if (_p === this._container) return line;
            line = _p;
        }
        return null;
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
    /**
     * @param {Node} line
     * @param {Array} validations
     * @returns {boolean} True to go on default event, false to prevent
     */
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
    findVerticalCell: function (cell, keyCode) {
        var row = cell.parentNode;
        var index = [].indexOf.call(row.children, cell);

        var sibling, child;
        switch (keyCode) {
            case CODE.ARROW_UP:
                sibling = 'previousElementSibling';
                break;
            case CODE.ARROW_DOWN:
                sibling = 'nextElementSibling';
                break;
            default:
                throw new Error('Parameter keyCode should suggest either up or don');
        }
        var siblingRow = row[sibling];
        if (siblingRow) return siblingRow.children[index];

        var currentTablePart = row.parentNode;
        var siblingTablePart = false;
        switch (currentTablePart.nodeName) {
            case 'THEAD': // Find TBODY
                if (keyCode == CODE.ARROW_UP) return false;
                // ArrowDown
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If no TBODY found, go from THEAD to TFOOT
                if (siblingTablePart) {
                    child = 'firstElementChild';
                    break;
                }
            case 'TFOOT': // Find TBODY
                // Skip TFOOT if the siblingTablePart is not initialized
                // This is equivalent to `currentTablePart.nodeName !== 'TFOOT'`
                // The later requires an extra dom property query (currentTablePart.nodeName)
                if (siblingTablePart !== false) break;
                // prevent default when ArrowDown
                if (keyCode == CODE.ARROW_DOWN) return false;
                // ArrowUp
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If no TBODY found, go from TFOOT to THEAD
                if (siblingTablePart) {
                    child = 'lastElementChild';
                    break;
                }
            case 'TBODY': // Find THEAD/TFOOT
                var tagName;
                if (keyCode == CODE.ARROW_UP) {
                    tagName = 'thead';
                    child = 'lastElementChild';
                } else {
                    tagName = 'tfoot';
                    child = 'firstElementChild';
                }
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName(tagName)[0];
        }

        if (!siblingTablePart) return false;

        siblingRow = siblingTablePart[child];
        if (!siblingRow) return false;

        return siblingRow.children[index] || false;

    },
    findSiblingCell: function (cell, keyCode) {
        var sibling, child;

        switch (keyCode) {
            case CODE.ARROW_RIGHT: // next
                sibling = 'nextElementSibling';
                child = 'firstElementChild';
                break;
            case CODE.ARROW_LEFT: // previous
                sibling = 'previousElementSibling';
                child = 'lastElementChild';
                break;
            default:
                throw new Error('Parameter keyCode should suggest either left or right');
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
        // current part enumerate in (THEAD TBODY TFOOT)
        var currentTablePart = currentRow.parentNode;
        var siblingTablePart = false;
        switch (currentTablePart.nodeName) {
            case 'THEAD': // Find body
                if (keyCode == CODE.ARROW_LEFT) return false;
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If the TBODY does not exist, try get the TFOOT instead
                if (siblingTablePart) break;
            case 'TFOOT': // Find body
                // Skip TFOOT if the siblingTablePart is not initialized
                // This is equivalent to `currentTablePart.nodeName !== 'TFOOT'`
                // The later requires an extra dom property query (currentTablePart.nodeName)
                if (siblingTablePart !== false) break;
                if (keyCode == CODE.ARROW_RIGHT) return false;
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName('tbody')[0];
                // If the TBODY does not exist, try get the THEAD instead
                if (siblingTablePart) break;
            case 'TBODY': // Find head/body
                siblingTablePart = currentTablePart.parentNode.getElementsByTagName(keyCode == CODE.ARROW_LEFT ? 'thead' : 'tfoot')[0];
                break;
            default:
                return false;
        }
        if (!siblingTablePart) return false;

        siblingRow = siblingTablePart[child];

        return siblingRow ? siblingRow[child] : false;
    },
    normalize: function (parentNode) {
        parentNode.normalize();

        // Collect text nodes
        // [arrayOfNodesInTheSameLine, ...]
        var nodes = [[]];
        var i = 0, _node = parentNode.firstChild;
        var endWithLF = false;
        var text, index;
        while (_node) {
            // Skip empty string
            if (_node instanceof Text && (text = _node.textContent)) {
                index = text.indexOf(LF);
                // If no LF, push into last two-dimension array, indexed by i
                if (index === -1) {
                    endWithLF = false;
                    if (!nodes[i]) nodes[i] = [];
                    nodes[i].push(_node);
                }
                // If there is, split the Text node,
                // then the split next text node should start a new array
                else {
                    endWithLF = true;
                    _node.splitText(index + 1);
                    _node.textContent = _node.textContent.substr(0, index);
                    nodes[i].push(_node);
                    nodes[++i] = [];
                }
                // } else if (_node instanceof Element && _node.nodeName != 'BR') {

            }
            _node = _node.nextSibling;
        }

        // Wrap the text with paragraph
        var r, wrapper;
        var normalized = false;
        ObjectHelper.each(nodes, function (k, nodeArray) {
            r = new Range();
            wrapper = Note.createElement('div');
            ObjectHelper.each(nodeArray, function (index, textNode) {
                // Break when the last element is LF
                if (k === i && nodeArray.length == index + 1 && endWithLF) {
                    return false;
                }
                if (index == 0) {
                    r.selectNode(textNode);
                    r.surroundContents(wrapper);
                } else {
                    wrapper.append(textNode);
                }
                normalized = true;
            });
            if (wrapper.innerText === '') {
                wrapper.normalize();
                wrapper.append(Note.createElement('br'));
            }
            r.detach();
        });
        if (normalized) Caret.focusAt(parentNode, -1);
        return normalized;
    },
    /**
     * Find the most-top level empty-text
     * or first parent block Element
     * recursively
     */
    findTopEmptyParent: function (node) {
        if (node.getText().length !== 0) {
            throw new Error('node must be an Element with no text');
        }
        if (node.contains(Note._container)) {
            throw new Error('node should be descendant of Note._container');
        }
        var parent = node;
        var _grand = parent.parentNode;
        while (
        _grand instanceof Node
        && _grand.getText().length === 0
        && Note._container !== _grand
            ) {
            parent = _grand;
            if (parent.isBlock()) break;
            _grand = parent.parentNode;
        }
        return parent;
    },
    removeNode: function (node) {
        node.remove();
    },
    /**
     * @param {string} tagName
     * @returns {Element}
     */
    createElement: function (tagName) {
        var element = document.createElement(tagName);
        // if (element.isBlock()) {
        //     element.dataset.wrapper = 'true';
        // }
        return element;
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
        return this.parentNode === Note._container;
    },
    getText: function () {
        if (this instanceof Text) return this.textContent;
        if (this instanceof Element) return this.innerText;
    },
    getHTML: function () {
        if (this instanceof Text) return this.textContent;
        if (this instanceof Element) return this.innerHTML;
    },
    isSelfClosing: function () {
        return /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test(this.nodeName);
    },
    isExtensible: function () {
        var sel = window.getSelection();
        if (!sel.isCollapsed) return false;

        if (sel.focusNode instanceof HTMLTableCellElement) {
            return false;
        }

        return true;
    },
    isBlock: function () {
        var yes = false;
        var $this = this;
        ArrayHelper.each([
            HTMLDivElement, HTMLLIElement, HTMLParagraphElement,
            HTMLTableElement, HTMLTableCellElement,
            HTMLLIElement
        ], function (k, node) {
            if ($this instanceof node) {
                yes = true;
                return false;
            }
        });

        return yes;
    },
    asWrapper: function () {
        this.dataset.wrapper = 1;
        return this;
    },
    isWrapper: function () {
        var data = this.dataset;
        return data && data.wrapper == 1;
    },
    /**
     * @param {Boolean} [editable=false]
     * @param {Boolean} [insertSP=false]
     */
    asEditable: function (editable, insertSP) {
        if (insertSP) this.after(document.createTextNode(SP));
        this.contentEditable = !!editable;
        return this;
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