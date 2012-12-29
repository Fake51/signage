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
        <div class="textbox">
            <textarea>Text goes here</textarea><button class="add-textbox">+</button>
            <button class="opener">Settings</button>
            <div class="clear"></div>
            <div class="textbox-settings">
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
        <p class="background">
            <label class="block">Background</label>
        </p>
        <button id="print">Print</button>
    </div>
    <div id="text-color-picker">
    </div>
    <div class="hidden">
<?php
$fonts = '';
foreach (scandir(__DIR__ . '/fonts') as $file) {
    if (!is_dir($file) && strtolower(substr($file, -4)) == '.ttf') :?>
        <span style="font-family: <?= htmlspecialchars(basename($file, '.ttf'), ENT_QUOTES, 'UTF-8');?>"> </span>
    <?php endif;
}
?>
    </div>
    <script>
<?php
$fonts = '';
foreach (scandir(__DIR__ . '/fonts') as $file) {
    if (!is_dir($file) && strtolower(substr($file, -4)) == '.ttf') {
        $fonts .= "'" . htmlspecialchars(basename($file, '.ttf'), ENT_QUOTES, 'UTF-8') . "',";
    }
}

$backgrounds = '';
foreach (scandir(__DIR__ . '/backgrounds') as $file) {
    if (!is_dir($file) && (stripos($file, '.jpg') || stripos($file, '.png'))) {
        $backgrounds .= "'" . htmlspecialchars($file, ENT_QUOTES, 'UTF-8') . "',";
    }
}
?>

    var fonts = [<?= trim($fonts, ',');?>];
    var backgrounds = [<?= trim($backgrounds, ',');?>];
    </script>
</body>
</html>
