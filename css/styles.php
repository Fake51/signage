<?php
header('HTTP/1.1 200 Done');
header('Content-Type: text/css; charset=UTF-8');

require '../functions.php';

?>
#controller {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 300px;
    border-right: 1px solid black;
    border-top: 1px solid black;
    z-index: 100;
    padding: 10px;
    background-color: #bfbfcf;
    <?= browserify('border-top-right-radius: 10px;');?>
}

#text-color-picker {
    position: fixed;
    bottom: 0;
    left: 320px;
    width: 195px;
    border-right: 1px solid black;
    border-top: 1px solid black;
    border-left: 1px solid black;
    z-index: 100;
    display: none;
}

#text-color {
    background-color: #000;
}

#container {
    width: 100%;
    height: 100%;
}

#controller div.box label,
label.block {
    float: left;
    display: block;
    width: 100px;
}

#controller div.box input {
    float: right;
    display: block;
}

textarea {
    width: 85%;
}

div.settings {
    display: none;
}

button.opener {
    float: right;
}

.clear {
    clear: both;
}

button.add-textbox,
button.remove-textbox {
    float:right;
}

input.text-color {
    background-color: #000;
}

.hidden {
    height: 0;
    width: 0;
    overflow: hidden;
}

p.icons img {
    cursor: pointer;
}

<?php foreach (getFonts() as $font => $file) : ?>
@font-face {
    font-family: <?= $font;?>;
    src: url('/fonts/<?= $file;?>');
}
<?php endforeach;?>
