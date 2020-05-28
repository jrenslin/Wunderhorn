<?PHP
/**
 * API for loading the cached genre list and manipulating it slightly.
 *
 * @author Joshua Ramon Enslin <joshua@museum-digital.de>
 */
declare(strict_types = 1);

# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/../inc/provideEnv.php";
define("CACHE_FILE", __DIR__ . "/../cache/genres.json");

$api = new WunderhornOutputJSON();

if (!file_exists(CACHE_FILE)) {
    throw new WunderhornMissingCache("Missing genre cache");
    return;
}

// Load cached genres

$genres = [];
$cachedGenres = json_decode(file_get_contents(CACHE_FILE), true);

foreach ($cachedGenres as $genre => $genreData) {

    try {
        $genreData["description"] = $api->_("{$genre}_description");
    }
    catch (WunderhornMissingTranslation $e) {
        $genreData["description"] = "";
    }
    $genres[$api->_($genre)] = $genreData;

}

$api->sendAPIHeaders("GET, OPTIONS");
$api->outputJsonAPIResult($genres);
