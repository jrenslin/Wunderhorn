<?PHP
/**
 * API for comment information.
 *
 * @author Joshua Ramon Enslin <jenslin@goethehaus-frankfurt.de>
 */
declare(strict_types = 1);

# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/../inc/provideEnv.php";
$api = new WunderhornOutputJSON();

if (empty($_GET['lang']) || empty($_GET['dir']) || empty($_GET['q'])
    || empty($lang = filter_var(trim($_GET['lang'], ", ./\\"), FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES))
    || empty($dir  = filter_var(trim($_GET['dir'], ", ./\\"), FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES))
    || empty($q    = filter_var(trim($_GET['q'], ", ./\\"), FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES))
    || !file_exists(__DIR__ . "/../data/{$dir}/{$q}.vtt")
) {
    http_response_code(404);
    $api->sendAPIHeaders("GET, OPTIONS");
    $api->outputJsonAPIResult([]);
    return;
}

// Load cached songs

$output = [
    "main" => [],
    "translation" => [],
    "comments" => [],
];

$mainTranscript = new WunderhornTranscript();
$mainTranscript->loadFromFile(__DIR__ . "/../data/{$dir}/{$q}.vtt");

$output = $mainTranscript->getTranscript();

$api->sendAPIHeaders("GET, OPTIONS");
$api->outputJsonAPIResult($output);
