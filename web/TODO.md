TODO
====
- individual container child `Text node` should be considered as line
- table
    - `Control + '+'`create new row
    - create new column
    - `Control + '-'` delete one row
    - delete one column
    - table with indent: table may be sub block of a line
- `-` to render a list
- category
    - multiple
- `Ctrl + D` to duplicate
    - One line
    - Multiple lines
- `>` To represent a block quote, if it's in at the beginning of a line
- images and links(&lt;a>&lt;/a>)
- type in " \\\` " should end into \<i>\`\</i> element to avoid intending to type in back quote by end with a code inline block

        \` => <i>`</i>
        \\ => <i>\</i>
- `Control + Alt + O` to search files
- Highlight code block
- `Esc` to activate md-alike edit mode, like vim editing MarkDown
- `Control + Shift + Enter` to create a line above current
- double click to render a textarea of code, for copy
- use number-dot structure to start a <ol> list
    - use `Enter` to create a new <li>
    - use `Shift + Enter` to start a new line within a <li>
    - use `Shift + Tab` to outdent to end a <ol> list

BUGS
===
- data-wrapper="1/2" should not generate SPs if there is non-empty chars around
    ```
        "ab <span data-wrapper="1/2">abcd</span>"
           ^
         here
    ```

- Punctuation close: press close-punctuation,
    check if there's a close already places after the caret,
    if there is, just move the caret after the close-punctuation
    ```
    e.g.

    'abcdI'
         ^
         press ' here, will trigger the caret from I to after the '

    'abcd'I
          ^
    ```
- table
    - press ArrowDown to move caret to the first line of the cell below(CL,RF)
        - If the cell is text-node-only and with multiple lines,
          cannot locate the accurate offset where the care should be placed
    - delete multiple lines over different cells result in exception
    - cannot use Arrow(Up/Down) to move caret from cell line of table inside to that of table outside
        |   title   |     title    |
        |           |    |t1|t2|   |

- meta
    - meta key does not trigger event keyup, prevent all default

- UndoManager
    - Caret change should trigger transactOnChange,
      but not every caret changes count,
      only significant ones count