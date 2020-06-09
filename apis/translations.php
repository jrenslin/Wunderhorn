<?PHP
/**
 * API for presenting all translations in JSON, to make them accessible for JS.
 *
 * @author Joshua Ramon Enslin <joshua@museum-digital.de>
 */
declare(strict_types = 1);

# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/../inc/provideEnv.php";

$api = new WunderhornOutputJSON();

// Load cached output

$output = [];

$translationDirs = [
    __DIR__ . "/../translations/general/",
    __DIR__ . "/../translations/custom/",
];

foreach ($translationDirs as $dir) {

    $filepath = $dir . $api->getLang() . ".php";
    if (file_exists($filepath)) {
        include $filepath;
        $output = array_merge($output, $tl);
    }

}

$api->sendAPIHeaders("GET, OPTIONS");
$api->outputJsonAPIResult($output);
