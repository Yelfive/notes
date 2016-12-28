/**
 * Created by felix on 11/3/16.
 */

var Key2Function = [
    {code: [CODE.CONTROL, CODE.S],keys: ['Control', 'S'], action: 'save', description: 'Save'},
    {code: [CODE.CONTROL, CODE.SHIFT, CODE.U], keys: ['Control', 'Shift', 'U'], action: 'toUpper', description: 'Change selection to Upper case'},
    {code: [CODE.CONTROL, CODE.SHIFT, CODE.L], keys: ['Control', 'Shift', 'L'], action: 'toLower', description: 'Change selection to Lower case'},
    {code: [CODE.SHIFT, CODE.ENTER], keys: ['Shift', 'Enter'], action: 'createNewLineBelow2Go', description: 'Create a new line below the caret, and move the caret to new line'},
    {code: [CODE.CONTROL, CODE.ENTER], keys: ['Control', 'Enter'], action: 'createNewLineBelow', description: 'Create a new line below the caret'},
    {code: [CODE.ENTER], keys: ['Enter'], action: 'extend', description: 'Extend live template'},
    // {code: ['Backspace'], keys: ['Backspace'], action: 'delete', description: '', type: 'builtin'},
    {code: [CODE.BACK_QUOTE], keys: ['BackQuote'], action: 'BackQuote', description: 'To create inline code area, use backslash to translate when you really want to use a back quote(e.g. \\`)', type: 'builtin'},
    {code: [CODE.TAB], keys: ['Tab'], action: 'tab', description: 'Insert a tab(4 spaces by default)'},
    {code: [CODE.SHIFT, CODE.TAB], keys: ['Shift', 'Tab'], action: 'tabReduce', description: 'Insert a tab(4 spaces by default)'},
    {code: [CODE.CONTROL, CODE.Z], keys: ['Control', 'Z'], action: 'undo', description: 'Undo'},
    {code: [CODE.CONTROL, CODE.Y], keys: ['Control', 'Y'], action: 'redo', description: 'Redo'},
    /* Table options */
    {code: [CODE.ALT, CODE.ARROW], keys: ['Alt', 'Arrow'], action: 'tableActions', description: 'Move to previous column in a table'},
    {code: [CODE.BACKSPACE], keys: ['Control', 'Backspace'], action: 'Backspace', type: 'builtin'},
    {code: [CODE.ARROW], keys: ['Arrow'], action: 'Arrow', type: 'builtin'}
];