TODO
====
- `Alt+Shift + Arrow*` to move line(s) in table
- `Tab` to indent or out indent multiple lines
- individual container child `Text node` should be considered as line
- table
    - create new row
    - create new column
    - delete one row
    - delete one column
    - table with indent: table may be sub block of a line
    - |a:|b:| to create a right-aligned text, likely, |:a| to left-aligned, |a| to center-aligned
- `-` to render a list
- category
    - multiple
- `Ctrl + E` to delete
    - One line
    - Multiple lines
- `Ctrl + D` to duplicate
    - One line
    - Multiple lines
- `Ctrl + Z` to undo
- `Ctrl + Y` to redo
- `>` To represent a block quote, if it's in at the beginning of a line
- `Ctrl + A` to select all
- `Control + B` to strong
- `Control + U` to underline
- `Control + I` to italic
- `Control + E` to delete current line
- images and links(&lt;a>&lt;/a>)
- type in `' " ( [` should wrap the selection, if there is one
- type in " \\\` " should end into \<i>\`\</i> element to avoid intending to type in back quote by end with a code inline block

        \` => <i>`</i>
        \\ => <i>\</i>
- `Control + Alt + O` to search files

BUGS
===
- table
    - press ArrowDown to move caret to the first line of the cell below(CL,RF)
        - If the cell is text-node-only, cannot locate the accurate offset where the care should be placed
- `Backspace` to delete
    - separator
    - text like
        ```
         abcdefg
         ;lkjg
        ^
        delete from here
        ```
    - cannot delete empty line inside table header <th>
    - cannot merge lines when multiple lines deleting
- code
    - inline code
        - Arrow around inline code acts abnormally
    - block
        - code contentEditable=false
        - ul contentEditable=true
- undo manager
    - arrow movement will trigger UndoManager.transact
    - changes happened after keydown will not be recorded
      by UndoManager
- tab
    - multiple lines selected
- meta
    - meta key does not trigger event keyup, prevent all default
- Chinese input
    - when Chinese get input, keyCode of 229 will be triggered
     and not being able to be revoked
