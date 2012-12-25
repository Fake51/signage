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
        <textarea id='text'>Text goes here</textarea>
        <button id="print">Print</button>
        <button class="opener">Settings</button>
        <div id="advanced">
            <div class="box">
                <label for="background-color">Background</label> <input id="background-color" type="text" value="#ffffff"/>
                <label for="text-color">Text</label> <input id="text-color" type="text" value="#000000"/>
                <label for="font-size">Font size</label> <input id="font-size" type="number" value="100"/>
            </div>
            <p class="alignment">
                <label class="block">Alignment</label>
                <input type="radio" name="alignment" id="left" class="alignment" value="left"/> <label for="left">Left</label>
                <input type="radio" name="alignment" id="center" checked="checked" class="alignment" value="center"/> <label for="left">Center</label>
                <input type="radio" name="alignment" id="right" class="alignment" value="right"/> <label for="left">Right</label>
            </p>
            <p class="font">
                <label class="block">Font</label>
            </p>
            <p class="background">
                <label class="block">Background</label>
            </p>
        </div>
    </div>
    <div id="background-color-picker">
    </div>
    <div id="text-color-picker">
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
