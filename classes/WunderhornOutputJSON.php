<?PHP
/**
 * This file contains a generic class for JSON APIs of the Wunderhorn viewer.
 */
declare(strict_types = 1);
# require_once __DIR__ . "/WunderhornOutput.php";

/**
 * Class for pages.
 */
class WunderhornOutputJSON extends WunderhornOutput {

    /**
     * Function for sending appropriate headers for APIs.
     *
     * @param string $methods Methods to accept. [POST, GET, PUT, ...].
     *
     * @return void
     */
    public function sendAPIHeaders(string $methods) {

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: " . $methods);
        header("Access-Control-Allow-Headers: X-PINGOTHER, Content-Type, Accept-Encoding, cache-control");
        header("Access-Control-Max-Age: 86400");

    }

    /**
     * Outputs result of a JSON API, setting the corrent headers.
     *
     * @param array $output String to output.
     *
     * @return void
     */
    public function outputJsonAPIResult(array $output) {

        header('Content-type: application/json');
        ob_start("ob_gzhandler");
        echo json_encode($output);
        exit;

    }

    /**
     * Constructor function needed for ensuring proper referal to given language
     * version.
     *
     * @return void
     */
    function __construct() {

        parent::__construct();

    }

}
