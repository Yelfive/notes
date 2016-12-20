/**
 * Created by felix on 12/18/16.
 */

/**
 * TODO: problems left
 * 1. how to undo character typing
 */
(function () {
    /**
     * xxx -> undo
     * /// -> redo
     * ######## stack ########
     | xxx *     |  <---- position = 5
     | xxx * /// |  <---- position = 4
     | xxx * /// |  <---- position = 3
     | xxx * /// |  <---- position = 2
     | xxx * /// |  <---- position = 1
     |     * /// |  <---- position = 0
     * #######################
     * position
     *  - 0 No undo
     *  - stack.length No redo
     * When an stack member comes in
     * For the same action, both redo and undo should be declared
     * Of which
     * the redo is for the `position`
     * the undo is for the `position+1`
     * and the position should increment by 1 : `position++`
     */
    function UndoManger() {

        var stack = [{}];
        /**
         * + `-1` No undo should be performed
         * + `stack.length` No redo should be performed
         * @type {number}
         */
        var position = 0; // -1: no undo should be performed, position=length: no redo should be performed
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

        var getStack = function (position) {
            return stack[position] || false;
        };

        this.transact = function (param) {
            if (param instanceof Object) {
                if (!param.undo) {
                    param.undo = function () {
                        document.execCommand('undo');
                    }
                }
                stack[position].redo = param.redo;
                stack.splice(position + 1);
                stack.push({
                    undo: param.undo
                });
                length = position + 1;
                this.redo();
            } else {
                throw new Error('options for UndoManager.transact must be JSON');
            }
        };

        this.undo = function () {
            if (position <= 0) {
                if (console) console.warn('this is the start position of the undo stack');
                return false;
            }
            var s = getStack(position);
            console.log(stack, position, s);
            s.undo();
            position--;
        };

        this.redo = function () {
            if (position >= length) {
                if (console) console.warn('this is the end position of the undo stack');
                return false;
            }
            var s = getStack(position);
            s.redo();
            position++;
            console.log(stack, position)
        };

        this.keyDownInterval = 20;
        this.keyDownCount = 0;
        /**
         * key down every 20, remember the text typed before
         */
        this.overwrite = function () {
            var sel = window.getSelection();
            // sel.g
        }
    }

    window.UndoManager = new UndoManger();

})();