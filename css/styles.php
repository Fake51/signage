<?php
header('HTTP/1.1 200 Done');
header('Content-Type: text/css; charset=UTF-8');

/**
 * returns css strings with browser specific prefixes
 * as well as the real css string
 *
 * @param string $css CSS bit to create browser specific bits for
 *
 * @return string
 */
function browserify($css)
{
    $return = '';
    foreach (array('-webkit', '-moz', '-ms', '-o') as $browser) {
        $return .= $browser . $css . PHP_EOL;
    }

    return $return . $css . PHP_EOL;
}

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

#background-color-picker,
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
    float: right
    display: block;
}

textarea {
    width: 98%;
}

#advanced {
    display: none;
}

button.opener {
    float: right;
}

.clear {
    clear: both;
}

<?php foreach (scandir(__DIR__ . '/../fonts') as $file) : ?>
    <?php if (!is_dir($file)) : ?>
@font-face {
    font-family: <?= htmlspecialchars(basename($file, '.ttf'), ENT_QUOTES, 'UTF-8');?>;
    src: url('/fonts/<?= $file;?>');
}
    <?php endif;?>
<?php endforeach;?>
