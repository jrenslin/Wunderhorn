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
        $this->_cli->write("  load-genres   Generates genre cache based on genre metadata");
        $this->_cli->write("  load-songs    Generates songs cache with all the audio files' metadata");

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
     * Loads genre information and caches it in file cache.
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

    /**
     * Retrieves and caches all audio files' metadata and other relevant
     * information about the songs.
     *
     * @return void
     */
    protected function loadSongs() {

        $files = $this->listFiles(['mp3', 'ogg', 'opus']);

        $songInfo = [];
        foreach ($files as $file) {

            $curSongInfo = [
                "filename" => $file,
                "metadata" => [],
            ];

            $this->_cli->write(PHP_EOL . "Loading song information for {$file}");

            // Get duration

            $parsed = exec("ffprobe -i " . escapeshellarg("{$this->_dataFolder}/$file") . " -show_format 2>/dev/null |  grep duration");
            $curSongInfo["duration"] = explode("=", $parsed)[1];

            // Parse metadata

            $parsed = explode(PHP_EOL, shell_exec("ffprobe -i " . escapeshellarg("{$this->_dataFolder}/$file") . " -show_format 2>/dev/null |  grep TAG"));

            foreach ($parsed as $line) {

                if (empty($line)) continue;

                $lineParts = explode("=", $line);
                $key   = str_replace("TAG:", "", $lineParts[0]);
                $value = $lineParts[1];

                if (empty($key) || empty($value)) continue;

                // Fix some values
                if ($key === "TIT3") $key = "title";

                $curSongInfo["metadata"][$key] = $value;
            }

            // Get reference to other files

            $fileBaseName = substr($file, 0, strrpos($file, "." . pathinfo($file, PATHINFO_EXTENSION)));
            $curSongInfo["filename_base"] = $fileBaseName;

            // Get thumbnail

            $thumb = $fileBaseName . ".jpg";

            // If genre artwork doesn't exist, extract it from file.
            if (!file_exists("{$this->_dataFolder}/{$thumb}")) {

                $this->_cli->write("Extracting album artwork for file {$file}");
                exec("ffmpeg -i " . escapeshellarg("{$this->_dataFolder}/{$file}") . " " . escapeshellarg("{$this->_dataFolder}/{$thumb}"));
                chmod("{$this->_dataFolder}/{$thumb}", 0644);

            }
            $curSongInfo["thumb"] = $thumb;

            // Check for webvtt
            if (file_exists("{$this->_dataFolder}/{$fileBaseName}.vtt")) {
                $curSongInfo["transcript"] = true;
                $this->_cli->write("{$file} has a transcript");
            }
            else $curSongInfo["transcript"] = false;

            $folder = pathinfo("{$this->_dataFolder}/{$file}", PATHINFO_DIRNAME);
            $curSongInfo["transcript_translations"] = [];

            // Check for translations
            $folderContents = array_diff(scandir($folder), [".", ".."]);
            $fileBaseNameBase = basename($fileBaseName);
            $fileBaseNameBaseLen = strlen($fileBaseNameBase);

            foreach ($folderContents as $otherFile) {
                if (substr($otherFile, 0, $fileBaseNameBaseLen) !== $fileBaseNameBase // Only take files with the same beginning as the base name of the main audio file.
                    || pathinfo($otherFile, PATHINFO_EXTENSION) !== "vtt"             // Exclude non-VTT files
                    || $otherFile === "{$fileBaseNameBase}.vtt"                       // Exclude the main translations
                ) {
                    continue;
                }
                $curSongInfo["transcript_translations"][] = substr(pathinfo($otherFile, PATHINFO_FILENAME), $fileBaseNameBaseLen + 1);
            }

            // Check for comments
            $curSongInfo["comments"] = [];
            if (is_dir("{$folder}/comments")) {
                $curSongInfo["comments"] = array_diff(scandir("{$folder}/comments"), ['.', '..']);
                $curSongInfo["comments"] = str_replace(".vtt", "", $curSongInfo["comments"]);
                $this->_cli->write("{$file} has the following comments streams");
            }
            else $curSongInfo["comments"] = false;

            $curSongInfo["mimetype"] = mime_content_type("{$this->_dataFolder}/{$file}");

            $songInfo[$fileBaseName] = $curSongInfo;

        }

        $this->toCache("songs.json", json_encode($songInfo, JSON_PRETTY_PRINT));

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
        else if (in_array("load-songs", $argv)) {
            $this->loadSongs();
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
