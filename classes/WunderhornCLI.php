<?PHP
/**
 * This file handles the logic for CLI operations.
 */
declare(strict_types = 1);

/**
 * Class for pages.
 */
class WunderhornCLI {

    private $_cli;
    private $_dataFolder;
    private $_cacheDir;

    /*
     *
     * Setters.
     *
     */

    /**
     * Setter for private variable $this->_cacheDir.
     *
     * @param string $cacheDir Directory name.
     *
     * @return void
     */
    public function setCacheDir(string $cacheDir = __DIR__ . "/../cache"):void {

        if (!is_dir($cacheDir)) mkdir($cacheDir);
        $this->_cacheDir = realpath($cacheDir);

    }

    /*
     *
     * Base functions
     *
     */

    /**
     * Takes an input string an writes it to the cache directory.
     *
     * @param string $filename Basename of the cache file.
     * @param string $input    File contents.
     *
     * @return void
     */
    private function toCache(string $filename, string $input) {

        $filename = trim($filename, "./");
        file_put_contents("{$this->_cacheDir}/{$filename}", $input);

    }

    /**
     * Function for listing data files by their extensions.
     *
     * @param array $extensions If set, the returned files are limited to ones
     *                          of the given extensions.
     *
     * @return array
     */
    public function listFiles(array $extensions = []):array {

        $output = [];

        $dataFolderContents = array_diff(scandir($this->_dataFolder), ['.', '..']);
        foreach ($dataFolderContents as $subdir) {

            if (!is_dir("{$this->_dataFolder}/{$subdir}")) {
                continue;
            }

            $subdirContents = array_diff(scandir("{$this->_dataFolder}/{$subdir}"), ['.', '..']);
            foreach ($subdirContents as $file) {

                if (!is_file("{$this->_dataFolder}/{$subdir}/{$file}")) {
                    continue;
                }

                if (!empty($extensions) and !in_array(pathinfo($file, PATHINFO_EXTENSION), $extensions)) {
                    continue;
                }

                $output[] = "{$subdir}/{$file}";

            }

        }

        return $output;

    }

    /*
     *
     * Actions
     *
     */

    /**
     * Function for writing help information.
     *
     * @return void
     */
    protected function printHelp():void {

        $this->_cli->write($this->_cli->_("cli_help_intro") . PHP_EOL);

        $this->_cli->write($this->_cli->_("cli_help_args"));
        $this->_cli->write("  load-genres");

    }

    /**
     * Function for writing help information and other helpful information.
     *
     * @return void
     */
    protected function printDefaultOutput():void {

        $this->printHelp();

        // To add later: Analysis of existence of cache files

    }

    /**
     * Function for parsing contents using ffmpeg.
     *
     * @return void
     */
    protected function loadGenres() {

        $files = $this->listFiles(['mp3', 'ogg', 'opus']);

        $genres = [];
        foreach ($files as $file) {

            $this->_cli->write(PHP_EOL . "Parsing genres from {$file}");

            $parsed = exec("ffprobe -i " . escapeshellarg("{$this->_dataFolder}/$file") . " -show_format 2>/dev/null |  grep TAG:genre");
            $genre = explode("=", $parsed)[1];

            // Set up new genre
            if (!isset($genres[$genre])) {

                // Load additional information

                // If genre artwork doesn't exist, extract it from file.
                if (!file_exists("{$this->_dataFolder}/genres/{$genre}.jpg")) {

                    $this->_cli->write("Extracting album artwork for genre {$genre} from file");

                    // Ensure directory for genre artwork exists
                    if (!is_dir("{$this->_dataFolder}/genres")) {
                        mkdir("{$this->_dataFolder}/genres", false, 0755);
                        $this->_cli->write("Directory for genre artwork was missing, created it");
                    }

                    // Extract album artwork
                    $this->_cli->write("Extract album artwork as genre artwork ({$genre})");
                    exec("ffmpeg -i " . escapeshellarg("{$this->_dataFolder}/$file") . " " . escapeshellarg("{$this->_dataFolder}/genres/{$genre}.jpg"));
                    chmod("{$this->_dataFolder}/genres/{$genre}.jpg", 0644);

                }
                $thumb = "genres/{$genre}.jpg";

                $genres[$genre] = [
                    "thumb" => $thumb,
                    "files" => [],
                ];

            }

            // Add this file to the genre
            $genres[$genre]["files"][] = $file;
        }

        $this->toCache("genres.json", json_encode($genres, JSON_PRETTY_PRINT));

    }

    /*
     *
     * Interface
     *
     */

    /**
     * Main function for parsing arguments and translating them into actions.
     *
     * @param array $argv Input arguments.
     *
     * @return void
     */
    public function run(array $argv):void {

        if (in_array("load-genres", $argv)) {
            $this->loadGenres();
        }
        else $this->printDefaultOutput();

    }

    /**
     * Constructor function needed for ensuring proper referal to given language
     * version.
     *
     * @return void
     */
    function __construct() {

        $this->_cli = new WunderhornOutputCLI();
        $this->_dataFolder = realpath(__DIR__ . "/../data");
        $this->setCacheDir();

    }

}
