<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Markdown</title>
    <link rel="stylesheet" href="../css/markdown.css">
    <script src="../js/markdown.js"></script>
    <style>
        html, body{
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        #source, #markdown {
            width: 45%;
            float: left;
            padding: 5px;
            overflow: auto;
            height: 100%;
        }
    </style>
</head>
<body>
<pre id="source">
<?= file_get_contents(__DIR__ . '/../../server/STANDARD.md'); ?>
</pre>
<div id="markdown"></div>
<script>
    window.onload = function () {
        var md = new Markup();
        var source = document.getElementById('source').innerHTML;
        document.getElementById('markdown').innerHTML = md.render(source);
    }
</script>
</body>
</html>