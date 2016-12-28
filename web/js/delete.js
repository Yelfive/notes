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
        _data: {},
        break: false,
        previousSiblingExists: function (goOn) {
            this.break = !goOn;
            // return goOn ? true : false;
        },
        /**
         * <div></div>
         * <div>I xxx</div>
         *      ^
         *      |
         *  press backspace here
         *  @return {null}
         */
        strictLineNoRange: function () {
            var previousSibling = this._data.previousSibling;
            this.range.selectNode(this.focusNode);
            this.caretNode = previousSibling;
            this.caretOffset = -1;
            this.break = true;
        },
        toRange: function () {

            /**
             * <div><span contenteditable="false"><code contenteditable="true">inline code text</code></span>I</div>
             *                                                                                               ^
             *                                                                                               |
             *                                                                                    press backspace here
             * select the whole [contenteditable="false"] Element to notify the user
             * the whole block will be deleted
             */

            // var data = previousSibling.data;
            // todo, delete table, block code
            Caret.setSelected(this._data.previousSibling);
            // if (data && data.key === 'fc-wrapper' || previousSibling.firstChild instanceof HTMLTableElement) {
            // } else if (!ObjectHelper.instanceOf(previousSibling, HTMLTableCellElement)) {

            //     Note.removeNode(this.focusNode);
            //     Caret.focusAt(previousSibling, -1);

            // }
            return false;
        },
        /**
         * When nothing is gonna be deleted,
         * select previous node to be deleted, if exists
         *
         * CAUTION: This should be called when range is collapsed
         */
        fromBeginning: function (goOn) {
            this.break = !goOn;
            return;
            return !!goOn;
            /**
             * <div></div>
             * <div>I xxx</div>
             *      ^
             *      |
             *  press backspace here
             */

            if (this.focusNode.isStrictLine() && previousSibling.firstElementChild.isBlock()) {
                this.range.selectNode(this.focusNode);
                this.caretNode = previousSibling;
                this.caretOffset = -1;
                return;
            }
            /**
             * <div><span contenteditable="false"><code contenteditable="true">inline code text</code></span>I</div>
             *                                                                                               ^
             *                                                                                               |
             *                                                                                    press backspace here
             * select the whole [contenteditable="false"] Element to notify the user
             * the whole block will be deleted
             */

            var data = previousSibling.data;
            // todo, delete table, block code
            console.log(previousSibling);
            if (data && data.key === 'fc-wrapper' || previousSibling.firstChild instanceof HTMLTableElement) {
                Caret.setSelected(previousSibling);
            } else if (!ObjectHelper.instanceOf(previousSibling, HTMLTableCellElement)) {
                Note.removeNode(this.focusNode);
                Caret.focusAt(previousSibling, -1);
            }
            return false;
        },
        process: function () {
            this.range.deleteContents();
        },
        end: function () {
            this.range.detach();
        },
        emptyAfterDeletion: function () {
            var next, parent, previous = this.caretNode.previousSibling;
            var data;
            if (!previous) {
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
                    parent.append(document.createElement('br'));
                } else {
                    this.caretNode = parent.previousSibling || parent.parentNode;
                    this.caretOffset = -1;
                    Note.removeNode(parent);
                }
            }
            // Previous sibling is fc-wrapper
            else if (previous && !previous.isEmpty()) {
                data = previous.dataset;
                if (data && data.type === 'fc-wrapper') {
                    var sp = document.createTextNode(SP);
                    previous.after(sp);
                    this.caretNode = sp;
                    this.caretOffset = 0;
                } else {
                    this.caretNode = previous;
                    this.caretOffset = -1;
                }
            }
            // Next sibling is fc-wrapper
            else if ((next = this.caretNode.nextSibling) && !next.isEmpty()) {
                data = next.dataset;
                if (data && data.type === 'fc-wrapper') {
                    next.before(document.createTextNode(SP));
                }
                this.caretNode = next;
                this.caretOffset = 0;
            } else {
                this.caretNode = this.caretNode.parentNode;
                this.caretOffset = 0;
            }
        }
    };

    var DeletionValidators = {
        before: {
            fromBeginning: function () {
                var fragments = this.range.cloneContents();
                if (fragments.childElementCount) {
                    // return false;
                    return 0;
                }
                return this.range.cloneContents().textContent.length === 0 ? 1 : 0;
                // return this.range.cloneContents().textContent.length === 0;
            },
            previousSiblingExists: function () {
                var previousSibling = this.focusNode.previousSibling;

                if (!ObjectHelper.instanceOf(previousSibling, HTMLElement)) return 0;
                this._data.previousSibling = previousSibling;
                return 1;
            },
            strictLineNoRange: function () {
                if (!this.focusNode.isStrictLine()) return false;

                if (this._data.previousSibling.childElementCount !== 1) return true;

                var block = this._data.previousSibling.firstElementChild;

                if (block.isBlock()) {
                    this._data.block = block;
                    return false;
                }
                return true;
            },
            toRange: function () {
                // todo, delete table, block code

                var previousSibling = this._data.previousSibling;
                var data = previousSibling.data;
                if (data && data.key === 'fc-wrapper' || this._data.block && this._data.block.isBlock()) return true;

                return false;
            }
        },
        during: {
            process: true
        },
        after: {
            emptyAfterDeletion: function () {
                return this.caretNode.getHTML() === '';
            }
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
            var valid;
            var goOn = null;
            ObjectHelper.each(DeletionValidators, function (type, validators) {
                $delete.break = false;
                ObjectHelper.each(validators, function (name, method) {
                    valid = method === true ? true : method.call($delete);
                    console.info('%cDeletion check for ' + name + ' : ' + valid, 'color: red');
                    if (valid !== false) {
                        goOn = $delete[name].call($delete, valid);
                        if (ObjectHelper.isBoolean(goOn) || $delete.break) return false;
                    }
                });
                if (ObjectHelper.isBoolean(goOn)) return false;
            });
            $delete.end();
            if (ObjectHelper.isBoolean(goOn)) {
                return goOn;
            } else {
                Caret.focusAt($delete.caretNode, $delete.caretOffset);
                return false;
            }
        }
    };

})();