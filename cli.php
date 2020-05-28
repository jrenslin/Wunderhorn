<?PHP
/**
 * Cli options
 */
declare(strict_types = 1);
# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/inc/provideEnv.php";

if (!isset($argv) || PHP_SAPI !== 'cli') {
    echo 'This script can only be called from the CLI';
    return;
}

$cli = new WunderhornCLI();
$cli->run($argv);
