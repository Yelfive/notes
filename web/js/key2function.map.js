/**
 * Created by felix on 11/3/16.
 */

var Key2Function = [
    {keys: ['Control', 'S'], action: 'save', description: 'Save'},
    {keys: ['Meta', 'S'], action: 'save', description: 'Save'},
    {keys: ['Control', 'Shift', 'U'], action: 'toUpper', description: 'Change selection to Upper case'},
    {keys: ['Control', 'Shift', 'L'], action: 'toLower', description: 'Change selection to Lower case'},
    {keys: ['Shift', 'Enter'], action: 'createNewLine2Go', description: 'Create a new line below the caret, and move the caret to new line'},
    {keys: ['Control', 'Enter'], action: 'createNewLine', description: 'Create a new line below the caret'},
    {keys: ['Enter'], action: 'extend', description: 'Extend live template'},
    {keys: ['Tab'], action: 'tab', description: 'Insert a tab(4 spaces by default)'}
];