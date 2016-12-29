/**
 * Created by felix on 12/18/16.
 */

/**
 * TODO: problems left
 * 1. how to undo character typing
 */
(function () {

    function Stack(container) {
        container.normalize();
        this.html = container.innerHTML;

        // Caret information
        var sel = window.getSelection();
        var caret;
        if (sel.anchorNode) {
            caret = {focusPath: [], collapsed: sel.isCollapsed};
            if (sel.isCollapsed === false) {
                caret.anchorPath = [];
                caret.anchorOffset = sel.anchorOffset;
                getCaretPath(sel.anchorNode, caret.anchorPath);
            }
            caret.focusOffset = sel.focusOffset;
            getCaretPath(sel.focusNode, caret.focusPath);
        } else {
            caret = null;
        }
        this.caret = caret;


        this.setCaret = function () {
            if (!caret) return this;
            if (caret.collapsed) {
                Caret.focusAt(findNodeByPath(caret.focusPath), caret.focusOffset);
            } else {
                Caret.setSelected(
                    findNodeByPath(caret.anchorPath), caret.anchorOffset,
                    findNodeByPath(caret.focusPath), caret.focusOffset
                );
            }
            return this;
        };
        this.setHTML = function () {
            container.innerHTML = this.html;
            return this;
        };

        function findNodeByPath(path) {
            var i, node = container;
            for (i = 0; i < path.length; i++) {
                node = node.childNodes[path[i]];
            }
            return node;
        }

        function getCaretPath(node, path) {
            if (path instanceof Array) {
                if (container !== node && container.contains(node)) {
                    var index = [].indexOf.call(node.parentNode.childNodes, node);
                    path.unshift(index);
                    getCaretPath(node.parentNode, path);
                }
            } else {
                throw new Error('Parameter path should be an array');
            }
        }
    }

    /**
     * - position
     *      0 stands for the most origin state, no undo exists
     *      `length - 1` for the latest state, no redo exists
     * - length
     *      length of the stack
     * - stack
     *      - html  {String}
     *      - caret {Object}
     */
    function UndoManger() {

        var stack = [];

        /**
         * Recover certain state from undo stack
         * @param {int} position
         */
        stack.recover = function (position) {
            var stack = this[position];
            if (stack) stack.setHTML().setCaret();
        };
        /**
         * + `-1` No undo should be performed
         * + `stack.length` No redo should be performed
         * @type {number}
         */
        var position = -1; // -1: no undo should be performed, position=length: no redo should be performed
        var length = 0;

        // Object.defineProperties(this, {
        //     'stack': {
        //         get: function () {
        //             return stack;
        //         }
        //     },
        //     'position': {
        //         get: function () {
        //             return position;
        //         }
        //     },
        //     'length': {
        //         get: function () {
        //             return length;
        //         }
        //     }
        // });

        this.container = null;

        var maxLength = 50;
        this.init = function (options) {
            if (options.container) this.container = options.container;
            if (options.transact) this.transact();
            if (options.maxLength) maxLength = options.maxLength;
        };

        this.transact = function () {
            position++;
            length = position + 1;

            stack.splice(position);
            stack.push(new Stack(this.container));

            if (length > maxLength) {
                stack.shift();
                length--;
                position--;
            }
            this.keyDownCount = 0;
        };

        this.transactOnChange = function () {
            if (stack[position].html !== this.container.innerHTML) {
                this.transact();
            }
        };

        this.undo = function () {
            if (position - 1 < 0) {
                if (console) console.warn('this is the start position of the undo stack');
                return false;
            }

            this.transactOnChange();

            stack.recover(--position)
        };

        this.redo = function () {
            if (position + 1 >= length) {
                if (console) console.warn('this is the end position of the undo stack');
                return false;
            }
            stack.recover(++position);
        };

        this.keyDownInterval = 5;
        this.keyDownCount = 0;
        /**
         * key down every 5, remember the text typed before
         * 1. type visible keys to push into stack
         *      1.1 the stack remembers the first node and offset of the first byte
         * 2. type space, other function map keys to close the stack member
         * 3. type 20 bytes to close the stack member
         *      3.1 take emoji into consideration
         * @return {boolean} True to go on default event, to get typed in
         */
        this.overwrite = function (code) {
            if (Note.isCharacterKey(code)
                && !Note.isKeyDown(CODE.CONTROL)
                && !Note.isKeyDown(CODE.ALT)
            ) {
                this.keyDownCount++;

                if (this.keyDownCount > this.keyDownInterval || code === CODE.BACKSPACE) {
                    this.transact();
                }

                return code !== CODE.BACK_QUOTE; // back quote(`) has extra functionality
            }
        };

        this.getState = function () {
            return {stack: stack, length: length, position: position};
        };

        this.clear = function () {
            stack.splice(0, length - 1);
            position = 0;
            length = 1;
        };
    }

    window.UndoManager = new UndoManger();

})();