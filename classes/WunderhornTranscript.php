<?PHP
/**
 * Contains a class for handling transcripts.
 */
declare(strict_types = 1);

/**
 * Class for transcripts.
 */
class WunderhornTranscript {

    private $_transcript;

    /**
     * Getters.
     */

    /**
     * Getter for transcript.
     *
     * @return array
     */
    public function getTranscript():array {

        return $this->_transcript;

    }

    /**
     * Getter for JSON-encoded transcript
     *
     * @return string
     */
    public function toJSON():string {

        return json_encode($this->_transcript);

    }

    /**
     * Magic function for getting a string output. Returns the JSON-encoded transript.
     *
     * @return string
     */
    public function __toString():string {

        return $this->toJSON();

    }

    /*
     *
     * Parsing inputs.
     *
     */

    /**
     * Parses an input WebVTT timestamp to float.
     *
     * @param string $timestamp Input timestamp, formatted: H:i:s.m.
     *
     * @return float
     */
    private function parseTimestamp(string $timestamp):int {

        $timestampParts = explode(":", $timestamp);

        // 1 hour   = 3,600,000 milliseconds
        // 1 minute =    60,000 milliseconds
        return intval(
            ((int)$timestampParts[0] * 3600000)         // Hour
            + ((int)$timestampParts[1] * 60000)         // Minutes
            + (floatval($timestampParts[2]) * 1000));   // Seconds

    }

    /**
     * Parses a WebVTT speech act to an array.
     * The array is losely formatted after Podlove's JSON outputs.
     *
     * @param string $speechAct A single speech act, beginning with the start time stamp.
     *
     * @return array
     */
    public function parseSpeechAct(string $speechAct):array {

        // Remove comments

        if (strpos($speechAct, "NOTE") !== false) {
            $speechAct = explode(PHP_EOL, $speechAct);

            // Remove notes / comments
            $commentsRemoved = false;
            foreach ($speechAct as $key => $value) {
                if (substr($value, 0, 4) === "NOTE") {
                    unset($speechAct[$key]);
                    $commentsRemoved = true;
                }
            }
            if ($commentsRemoved === true) $speechAct = array_values($speechAct);
            $speechAct = implode(PHP_EOL, $speech);
        }

        // Parse basic information
        list($start, $speech) = explode(" --> ", $speechAct);

        // Strip cues before start
        if (($startLastEOL = strrpos($start, PHP_EOL)) !== false) {
            $start = trim(substr($start, $startLastEOL));
        }
        $end = substr($speech, 0, strpos($speech, PHP_EOL));
        $speech = trim(substr($speech, strpos($speech, PHP_EOL)));

        // Remove positioning information from end, if there are any
        if (($endTimeEndPos = strpos($end, " ")) !== false) {
            $end = substr($end, 0, $endTimeEndPos);
        }

        // Parse voice (if available)
        $voice = "";
        if (($voiceTagStart = strpos($speech, "<v ")) !== false) {
            $voice = substr($speech,
                $voiceTagStart + 3,
                strpos($speech, ">", $voiceTagStart) - $voiceTagStart - 3);
        }

        // Remove all other speech cues
        $speech = strip_tags($speech);

        // Translate start and end date to milliseconds

        $output = [
            "start"     => $start,
            "start_ms"  => $this->parseTimestamp($start),
            "end"       => $end,
            "end_ms"    => $this->parseTimestamp($end),
            "voice"     => $voice,
            "text"      => $speech,
        ];

        return $output;

    }

    /**
     * Loads transcript from a WebVTT string.
     *
     * @param string $input Input string.
     *
     * @return void
     */
    public function loadFromString(string $input):void {

        // Ensure the first six characters are "WEBVTT", else throw an exception
        if (substr($input, 0, 6) !== "WEBVTT") {
            throw new WunderhornInvalidFormat("A WebVTT string must begin with 'WEBVTT'.");
        }

        // Strip away first line and trim whitespaces and newlines from beginning and end.
        $input = trim(substr($input, strpos($input, PHP_EOL)));

        // Break input string apart into single speech acts / lines.
        $speechActs = explode(PHP_EOL . PHP_EOL, $input);

        foreach ($speechActs as $key => $speechAct) {

            $this->_transcript[] = $this->parseSpeechAct($speechAct);

        }

    }

    /**
     * Function for loading from a WebVTT file.
     *
     * @param string $filename File name of the WebVTT file to parse and load.
     *
     * @return void
     */
    public function loadFromFile(string $filename):void {

        if (!file_exists($filename)) {
            throw new WunderhornFileDoesNotExist("The file {$filename} does not exist.");
        }

        $fileContents = file_get_contents($filename);
        $this->loadFromString($fileContents);

    }

    /**
     * Constructor sets default values.
     *
     * @return void
     */
    function __construct() {

        $this->_transcript = [];

    }

}
