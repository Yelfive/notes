Block Elements
==============

Paragraph
---------
Line ended with another empty line
will be consider as a paragraph

And with an extra empty line, this will be a new paragraph

Code
----
If you want a code block, there are two ways to realize

1. start with more than 4 spaces or 1 tag than this layer requires
    
        hello world
        this is inside a code block
1. start with more than three backtick and end with the same amount

    ```php
    
    namespace a/b;
    
    class A extends B 
    {
        public function ImOverwritingB()
        {
            // something
        }
    }
    
    ```
    
Title
-----

# h1
## h2
### h3
#### h4
##### h5
###### h6

Sharp(#) stands for title element besides line ended with another line with only (-|=)

or no-empty line with a line of (- or =) appended

Separator Element
-----------------
---
===
More than three minus or equal signs 

   This is a title
------------------

    This is however not a title, it's a code block and a single separator 
-------------------------------------------------------------------------

Title and separator are quiet similar,
except for the former has a previous non-empty, no-formatted line
and the later the opposite

123
---==

===


---
sdfsdf

# 12
   # 12
    # 12
