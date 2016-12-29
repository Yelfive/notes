/**
 * Created by felix on 12/27/16.
 */

(function () {

    function DeleteBase() {
        var sel = window.getSelection();
        this.focusNode = sel.focusNode;
        var offset = sel.focusOffset;

        if (0 === sel.rangeCount) return;

        this.range = sel.getRangeAt(0);

        if (this.range.collapsed || this.range.commonAncestorContainer instanceof Text) {
            this.multipleLines = false;
            this.range.setStart(this.focusNode, offset > 1 ? offset - 1 : 0);
        } else {
            this.multipleLines = this.range.commonAncestorContainer.querySelector('div,li') ? true : false;
        }

        // Record node & offset before deleteContents
        // or r.startContainer will be changed
        this.caretNode = this.range.startContainer;
        this.caretOffset = this.range.startOffset;
    }

    DeleteBase.prototype = {
        _hasPreviousSiblingAfterDeletion: function (previousSibling) {
            if (previousSibling.isWrapper()) {
                this.caretNode = document.createTextNode(SP);
                this.caretOffset = 0;
                previousSibling.after(this.caretNode);
            } else {
                this.caretNode = previousSibling;
                this.caretOffset = -1;
            }
        },
        /**
         * Handle only next sibling
         * @returns {boolean}
         * @private
         */
        _hasNextSiblingAfterDeletion: function (nextSibling) {
            if (nextSibling.isWrapper()) {
                this.caretNode = document.createTextNode(SP);
                this.caretOffset = 0;
                nextSibling.before(this.caretNode);
            } else {
                // do nothing
            }
        },
        _hasNoSiblingAfterDeletion: function () {
            var parent = Note.findTopEmptyParent(this.caretNode);
            if (parent.isBlock()) {
                parent.innerHTML = '<br>';
                this.caretNode = parent;
                this.caretOffset = 0;
                return false;
            }
            this.caretNode = parent.previousSibling;
            if (this.caretNode) {
                if (this.caretNode.isWrapper()) {
                    this.caretNode.after(document.createTextNode(SP));
                }
                this.caretOffset = -1;
            } else {
                this.caretNode = parent.nextSibling;
                if (this.caretNode.isWrapper()) {
                    var sp = document.createTextNode(SP);
                    this.caretNode.before(sp);
                    this.caretNode = sp;
                }
                this.caretOffset = 0;
            }
            Note.removeNode(parent);
        },
        _emptyAfterDeletion: function () {
            var previousSibling = this.caretNode.previousSibling;

            /**
             * 1.
             * <div><b>aI</b><div>
             *          ^
             * <div><b>aI</b>bcd<div>
             *          ^
             * <div>abc<b>aI</b>bcd<div>
             *             ^
             * 2.
             * <div>aI</div>
             *       ^
             * <div>aIb</div>
             *       ^
             * 3.
             * <div><b>a</b>bI</div>
             *               ^
             * 4.
             * <div>aI<code>text</code></div>
             *       ^
             */
            /*
             *  if (previous sibling is found) {
             *      if (previous is wrapper) {
             *          // insert a sp after previous sibling
             *      } else {
             *          // caret focus at previous sibling with offset -1
             *      }
             *  } else { // previousSibling is not found
             *      // try next sibling
             *      if (next sibling is found) {
             *          if (next sibling is wrapper) {
             *              // insert a sp before next sibling
             *              return false;
             *          }
             *          // else do nothing
             *      } else {
             *          // find the most top-level empty parent, till the line Element
             *          if (parent is block) {
             *              // insert a <br> to prevent the block invisible
             *          } else {
             *              // find the previous sibling of the parent
             *              if (parent previous sibling found) {
             *                  Caret.focusAt(parent.previousSibling, -1);
             *                  if (parent's previous sibling is wrapper) {
             *                      insert sp after previous sibling of parent
             *                  }
             *              } else { // parent's next sibling found
             *                  Caret.focusAt(parent.nextSibling, 0);
             *                  if (next is wrapper) {
             *                      insert SP before next sibling of parent
             *                  }
             *              }
             *              // remove the parent
             *          }
             *      }
             *
             *  }
             *
             *
             */

            if (previousSibling instanceof Node) {
                return this._hasPreviousSiblingAfterDeletion(previousSibling);
            }

            var nextSibling = this.caretNode.nextSibling;
            if (nextSibling instanceof Node) {
                return this._hasNextSiblingAfterDeletion(nextSibling);
            }

            this._hasNoSiblingAfterDeletion();
        },
        _fromBeginning: function () {
            var fragments = this.range.cloneContents();
            if (fragments.childElementCount) {
                return false;
            }
            return fragments.textContent.length === 0;
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
         * Try merging `from` into `to` as the appended
         * Do nothing if `from` or `to` is not HTMLElement
         * @param {HTMLElement} from
         * @param {HTMLElement} to
         * @param {Boolean} [focusTo=false] Whether to set caret to focus at `to`,
         * it will not change default caret action if set false
         * @private
         */
        _tryMergingAfter: function (from, to, focusTo) {
            var children = from.childNodes;
            if (from instanceof HTMLElement && to instanceof HTMLElement) {

                // Empty line has a bare <br> in the end, strip it
                var br = to.querySelector('br');
                if (br) Note.removeNode(br);

                // Record first node of children,
                // `children` is a live collection,
                // the subsequent iteration will empty the collection
                var firstNode = children[0];

                var node;
                while (node = children[0]) {
                    to.append(node)
                }

                if (focusTo) {
                    var caret, offset;
                    var previous = firstNode.previousSibling;
                    if (previous) {
                        caret = previous;
                        offset = -1;
                    } else {
                        caret = firstNode;
                        offset = 0;
                    }
                    Caret.focusAt(caret, offset);
                }
                Note.removeNode(from);
            }
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
            if (false === previousSibling instanceof HTMLElement) {
                var current = Note.getCurrentLine(this.focusNode);
                this._tryMergingAfter(current, current.previousElementSibling, true);
                return false;
            }

            /**
             *
             * ##### Condition 1 #####
             *
             * <div>
             *     <span contentEditable="false">
             *          <code contentEditable="true" data-type="wrapper">inline code text</code></span>I
             * </div>
             *                                                                                         ^
             *                                                                                         |
             *                                                                               press backspace here
             *
             * Short version:
             *  `inline code text`I xxx
             *                    ^
             *                    |
             *                 Caret here
             * select the whole [contentEditable="false"] Element to notify the user
             * the whole block will be deleted
             *
             * ##### Condition 2 #####
             *
             * <div><table>...</table></div>
             * <div>I<div>
             *      ^
             *      |
             */
            if (previousSibling.isWrapper() || this._validBlockLine(previousSibling) || previousSibling.isSelfClosing()) {
                Caret.setSelected(previousSibling);
                return false;
            }
            else {
                /**
                 * <div>some text or inline elements</div>
                 * <div>I</div>
                 *      ^
                 *      |
                 *     here
                 */
                if (this.focusNode.isEmpty()) {
                    this.range.selectNode(this.focusNode);
                }
                /**
                 *  only self-closing tag like <br> will do this
                 *  I<br>some other text
                 *  ^
                 */
                else {
                    var firstChild = this.focusNode.firstChild;
                    this.range.selectNode(firstChild);

                    // Ensure the subsequent inline-code is surrounded by SP
                    var secondChild = firstChild.nextSibling;
                    if (secondChild && secondChild.isWrapper() && secondChild.querySelector('code')) {
                        secondChild.before(document.createTextNode(SP));
                    }
                }
                this.caretNode = previousSibling;
                this.caretOffset = -1;
            }
        },
        run: function () {
            this.range.deleteContents();
        },
        afterRun: function () {
            if (!this.caretNode.isSelfClosing() && this.caretNode.getHTML() === '') this._emptyAfterDeletion();
            this.end();
        },
        end: function () {
            var currentLine = Note.getCurrentLine(this.caretNode);
            if (currentLine) { // Caret may disappear
                if (this.multipleLines) this._tryMergingAfter(currentLine.nextElementSibling, currentLine);
            }
            Caret.focusAt(this.caretNode, this.caretOffset);
            if (currentLine) currentLine.normalize();
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

            if (!$delete.range) return false;

            $delete.beforeRun() !== false
            && $delete.run() !== false
            && $delete.afterRun();

            // always returns false to prevent default
            return false;
        }
    };

})();