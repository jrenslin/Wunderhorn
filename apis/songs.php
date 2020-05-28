<?PHP
/**
 * Start page of simple music browser.
 *
 * @author Joshua Ramon Enslin <joshua@museum-digital.de>
 */
declare(strict_types = 1);

# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/../inc/provideEnv.php";
define("CACHE_FILE", __DIR__ . "/../cache/songs.json");

$api = new WunderhornOutputJSON();

if (!file_exists(CACHE_FILE)) {
    throw new WunderhornMissingCache("Missing songs cache");
    return;
}

// Load cached songs

$songs = [];
$cachedSongs = json_decode(file_get_contents(CACHE_FILE), true);

foreach ($cachedSongs as $song => $songData) {

    $songs[$song] = $songData;
    // $songs[$api->_($song)] = $songData;

}

$api->sendAPIHeaders("GET, OPTIONS");
$api->outputJsonAPIResult($songs);
