<?PHP
/**
 * This file sets up the importer.
 */
declare(strict_types = 1);

// Load global functions

require_once __DIR__ . "/functions.php";

// Set autoloader

spl_autoload_register(function ($className) {

    $classDirs = [
        __DIR__ . "/../exceptions",
        __DIR__ . "/../classes",
    ];

    foreach ($classDirs as $classDir) {

        if (file_exists("$classDir/$className.php")) {
            include "$classDir/$className.php";
        }

    }
});

// Set exception handler for errors of log level E_USER_NOTICE
// The handler logs the errors to a log file.

# set_error_handler("mdImporterErrorHandler", E_USER_NOTICE);
