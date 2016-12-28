/**
 * Created by felix on 12/27/16.
 */

(function () {

    function DeleteBase() {
        var sel = window.getSelection();
        this.focusNode = sel.focusNode;
        var offset = sel.focusOffset;

        this.range = sel.getRangeAt(0);

        if (this.range.collapsed) this.range.setStart(this.focusNode, offset > 1 ? offset - 1 : 0);

        // Record node & offset before deleteContents
        // or r.startContainer will be changed
        this.caretNode = this.range.startContainer;
        this.caretOffset = this.range.startOffset;
    }

    DeleteBase.prototype = {
        _emptyAfterDeletion: function () {
            var next, parent, previousSibling = this.caretNode.previousSibling;
            var data;
            if (!previousSibling) {
                /**
                 *  <div>abd<b>dI</b></div>
                 *              ^
                 *  The deletion will end into an empty <b></b>
                 *  So the b Element should be deleted too
                 */
                parent = Note.findTopEmptyParent(this.caretNode);

                if (parent.isBlock()) {
                    /**
                     * Line will be empty, without even <br>,
                     * if the the line is typed with letters and then deleted,
                     * thus the parent would be invisible in editor
                     * and the subsequent typing will be in bare Note._container without line wrapper
                     * Thus, append an <br> there
                     */
                    parent.append(Note.createElement('br'));
                } else {
                    this.caretNode = parent.previousSibling || parent.parentNode;
                    this.caretOffset = -1;
                    Note.removeNode(parent);
                }
            }
            // Previous sibling is wrapper
            else if (previousSibling && !previousSibling.isEmpty()) {
                data = previousSibling.dataset;
                if (data && data.type === 'wrapper') {
                    var sp = document.createTextNode(SP);
                    previousSibling.after(sp);
                    this.caretNode = sp;
                    this.caretOffset = 0;
                } else {
                    this.caretNode = previousSibling;
                    this.caretOffset = -1;
                }
            }
            // Next sibling is wrapper
            else if ((next = this.caretNode.nextSibling) && !next.isEmpty()) {
                data = next.dataset;
                if (data && data.type === 'wrapper') {
                    next.before(document.createTextNode(SP));
                }
                this.caretNode = next;
                this.caretOffset = 0;
            } else {
                this.caretNode = this.caretNode.parentNode;
                this.caretOffset = 0;
            }
        },
        _fromBeginning: function () {
            var fragments = this.range.cloneContents();
            if (fragments.childElementCount) {
                return false;
            }
            return this.range.cloneContents().textContent.length === 0;
        },
        /**
         *
         * @param {HTMLElement} element
         * @private
         */
        _validBlockLine: function (element) {
            if (element.childElementCount === 1) {
                return element.lastElementChild.isBlock();
            }
            return false;
        },
        /**
         * When nothing is gonna be deleted,
         * select previous node to be deleted, if exists
         *
         * CAUTION: This should be called when range is collapsed
         */
        beforeRun: function () {
            if (this._fromBeginning() === false) return null;

            /**
             * <div></div>
             * <div>I xxx</div>
             *      ^
             *      |
             *  press backspace here
             */
            var previousSibling = this.focusNode.previousElementSibling;
            if (false === previousSibling instanceof HTMLElement) return false;


            var data = previousSibling.dataset;
            if (data && data.type == 'wrapper') {
                // todo: merge
                Caret.setSelected(previousSibling);
                return false;
            }

            if (!this.focusNode.isStrictLine()) return null;

            var block = this._validBlockLine(previousSibling);

            /**
             * <div><span contentEditable="false"><code contentEditable="true">inline code text</code></span>I</div>
             *                                                                                               ^
             *                                                                                               |
             *                                                                                    press backspace here
             * select the whole [contentEditable="false"] Element to notify the user
             * the whole block will be deleted
             */
            /**
             * <div><table>...</table></div>
             * <div>I<div>
             *      ^
             *      |
             */
            if (block) {
                // todo merge
                Caret.setSelected(previousSibling);
                return false;
            }
            /**
             * <div>some text or inline elements</div>
             * <div>I</div>
             *      ^
             *      |
             *     here
             */
            else {
                this.range.selectNode(this.focusNode);
                this.caretNode = previousSibling;
                this.caretOffset = -1;
            }
            return null;
        },
        run: function () {
            this.range.deleteContents();
        },
        afterRun: function () {
            if (this.caretNode.getHTML() === '') this._emptyAfterDeletion();
            this.end();
        },
        end: function () {
            Caret.focusAt(this.caretNode, this.caretOffset);
            this.range.detach();
        }
    };

    window.Delete = {
        /**
         *
         * @return {Boolean|null} Boolean indicates whether to run default event, others to go on next check
         * - true Go on default
         * - false Prevent default
         * - null(i.e) Go on other checks defined in param `conditions`
         */
        run: function () {
            var $delete = new DeleteBase();

            $delete.beforeRun() !== false
            && $delete.run() !== false
            && $delete.afterRun();

            // always returns false to prevent default
            return false;
        }
    };

})();