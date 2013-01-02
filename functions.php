<?php
require 'definitions.php';

/**
 * returns array of friendly name => filename
 * of fonts present in the system
 *
 * @return array
 */
function getFonts()
{
    $fonts = array();
    foreach (scandir(FONTS_PATH) as $file) {
        if (!is_dir($file) && strtolower(substr($file, -4)) == '.ttf') {
            $fonts[htmlspecialchars(basename($file, '.ttf'), ENT_QUOTES, 'UTF-8')] = $file;
        }
    }

    return $fonts;
}

/**
 * returns all available backgrounds as paths
 * in an array
 *
 * @return array
 */
function getBackgrounds()
{
    $backgrounds = array();
    foreach (scandir(BACKGROUNDS_PATH) as $file) {
        if (!is_dir($file) && (stripos($file, '.jpg') || stripos($file, '.png')) && getimagesize(BACKGROUNDS_PATH . $file)) {
            $backgrounds[] = str_replace(BASE_PATH, '', BACKGROUNDS_PATH) . htmlspecialchars($file, ENT_QUOTES, 'UTF-8');
        }
    }

    return $backgrounds;
}

/**
 * returns all available icons as paths
 * in an array
 *
 * @return array
 */
function getIcons()
{
    $icons = array();
    foreach (scandir(ICONS_PATH) as $file) {
        if (!is_dir($file) && (stripos($file, '.jpg') || stripos($file, '.png')) && getimagesize(ICONS_PATH . $file)) {
            $icons[] = str_replace(BASE_PATH, '', ICONS_PATH) . htmlspecialchars($file, ENT_QUOTES, 'UTF-8');
        }
    }

    return $icons;
}

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

/**
 * returns the path of a thumbnail for the
 * image path provided
 *
 * @param string $path Path to file to get/make thumbnail for
 *
 * @return string
 */
function getIconThumbnail($path)
{
    $basename = basename($path);

    if (!is_file(ICONS_PATH . $basename)) {
        return '';
    }

    $thumbnail_path = ICONTHUMBNAILS_PATH . $basename;
    if (is_file($thumbnail_path) && getimagesize($thumbnail_path)) {
        return str_replace(BASE_PATH, '', $thumbnail_path);
    }

    return makeThumbnail($basename);
}

/**
 * creates a thumbnail for the icon path provided
 *
 * @param string $basename Base name of icon to make thumbnail of
 *
 * @return string
 */
function makeThumbnail($basename)
{
    $image_path = ICONS_PATH . $basename;
    $image_info = getimagesize($image_path);
    if (!$image_info) {
        return '';
    }

    switch ($image_info[2]) {
    case IMAGETYPE_JPEG:
        $image = imagecreatefromjpeg($image_path);
        break;

    case IMAGETYPE_PNG:
        $image = imagecreatefrompng($image_path);
        break;

    default:
        return '';
    }

    if ($image_info[0] <= 20 && $image_info[1] <= 20) {
        $destination_height = $image_info[1];
        $destination_width  = $image_info[0];

    } else {

        if ($image_info[0] < $image_info[1]) {
            $destination_height = THUMBNAILSIZE;
            $destination_width  = $image_info[0] / ($image_info[1] / THUMBNAILSIZE);

        } else {
            $destination_width  = THUMBNAILSIZE;
            $destination_height = $image_info[1] / ($image_info[0] / THUMBNAILSIZE);
        }
    }

    $output_image = imagecreatetruecolor($destination_width, $destination_height);
    imagesavealpha($output_image, true);
    imagealphablending($output_image, true);
    $trans_colour = imagecolorallocatealpha($output_image, 255, 255, 255, 127);
    imagefill($output_image, 0, 0, $trans_colour);
    imagealphablending($output_image, true);

    imagecopyresampled($output_image, $image, 0, 0, 0, 0, $destination_width, $destination_height, $image_info[0], $image_info[1]);

    if (imagepng($output_image, ICONTHUMBNAILS_PATH . $basename, 9)) {
        return str_replace(BASE_PATH, '', ICONTHUMBNAILS_PATH . $basename);
    }

    return '';
}
