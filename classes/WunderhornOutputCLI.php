<?PHP
/**
 * Contains a class for generating CLI outputs.
 */
declare(strict_types = 1);
# require_once __DIR__ . "/WunderhornOutput.php";

/**
 * Class for CLI outputs.
 */
class WunderhornOutputCLI extends WunderhornOutput {

    /**
     * Outputs a string.
     *
     * @param string $input String to print.
     *
     * @return void
     */
    public function write(string $input):void {

        echo $input . PHP_EOL;

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

    /**
     * Constructor function needed for ensuring proper referal to given language
     * version.
     *
     * @return void
     */
    function __destruct() {

        echo PHP_EOL;

    }

}
