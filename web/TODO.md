TODO
====
- individual container child `Text node` should be considered as line
- table
    - create new row
    - create new column
    - delete one row
    - delete one column
    - table with indent: table may be sub block of a line
- `-` to render a list
- category
    - multiple
- `Ctrl + D` to duplicate
    - One line
    - Multiple lines
- `>` To represent a block quote, if it's in at the beginning of a line
- `Control + B` to strong
- `Control + U` to underline
- `Control + I` to italic
- images and links(&lt;a>&lt;/a>)
- type in " \\\` " should end into \<i>\`\</i> element to avoid intending to type in back quote by end with a code inline block

        \` => <i>`</i>
        \\ => <i>\</i>
- `Control + Alt + O` to search files
- Highlight code block
- `Esc` to activate md-alike edit mode, like vim editing MarkDown

BUGS
===
- title
    - press `Enter` in middle of title, then the backspace
        ```
         h1 title

         h1
         title
        ^
        |
        Caret here, press backspace
        ```
- table
    - press ArrowDown to move caret to the first line of the cell below(CL,RF)
        - If the cell is text-node-only and with multiple lines,
          cannot locate the accurate offset where the care should be placed
- meta
    - meta key does not trigger event keyup, prevent all default
