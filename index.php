<?php require 'functions.php';?>
<!DOCTYPE html>
<html lang="en">
<head>
    <link href="/css/styles.php" rel="stylesheet"/>
    <link href="/js/farbtastic/farbtastic.css" rel="stylesheet"/>
    <script src="/js/jquery-1.8.3.min.js"></script>
    <script src="/js/farbtastic/farbtastic.js"></script>
    <script src="/js/fabric.min.js"></script>
    <script src="/js/script.js"></script>
</head>
<body>
    <canvas id="container">
    </canvas>
    <div id="controller">
        <div class="contentbox">
            <textarea>Text goes here</textarea><button class="add-textbox">+</button>
            <button class="opener">Settings</button>
            <div class="clear"></div>
            <div class="settings">
                <div class="box">
                    <label>Text color</label> <input class="text-color" type="text" value="#000000"/>
                    <label>Font size</label> <input class="font-size" type="number" value="100"/>
                </div>
                <p class="alignment">
                    <label class="block">Alignment</label>
                    <input type="radio" name="alignment" class="left alignment" value="left"/> <label for="left">Left</label>
                    <input type="radio" name="alignment" class="center alignment" checked="checked" value="center"/> <label for="left">Center</label>
                    <input type="radio" name="alignment" class="right alignment" value="right"/> <label for="left">Right</label>
                </p>
                <p class="font">
                    <label class="block">Font</label>
                </p>
            </div>
        </div>
        <p class="icons">
<?php foreach (getIcons() as $icon) :?>
    <img src="<?= getIconThumbnail($icon);?>" alt="" data-path="<?= $icon;?>"/>
<?php endforeach;?>
        </p>
        <p class="background">
            <label class="block">Background</label>
        </p>
        <button id="print">Print</button>
    </div>
    <div id="text-color-picker">
    </div>
    <div class="icon-box hidden">
        <button class="remove-box">-</button>
        <button class="opener">Settings</button>
        <div class="clear"></div>
        <div class="settings">
            <p>
                <label>Scaling</label> <input type="number" value="100" class="scale"/>
            </p>
        </div>
    </div>
    <div class="hidden fonts">
<?php
$fonts = '';
foreach (getFonts() as $font => $file) :?>
        <span style="font-family: <?= $font;?>" data-font="<?= $font;?>"> </span>
<?php endforeach;?>
    </div>
    <script>
<?php
$backgrounds = '';
foreach (getBackgrounds() as $file) {
    $backgrounds .= "'" . $file . "',";
}
?>

    var backgrounds = [<?= trim($backgrounds, ',');?>];
    </script>
</body>
</html>
