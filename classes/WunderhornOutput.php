<?PHP
/**
 * This file contains a generic class for generating outputs for the Wunderhorn
 * Music viewer.
 */
declare(strict_types = 1);

/**
 * Class for pages.
 */
class WunderhornOutput {

    private $_lang;
    private $_translations;

    /**
     * Function lang_getfrombrowser gets the browser language based on HTTP headers.
     *
     * @param array   $allowed_languages Array containing all the languages for which
     *                                   there are translations.
     * @param string  $default_language  Default language of the instance of MD.
     * @param boolean $strict_mode       Whether to demand "de-de" (true) or "de" (false) Optional.
     *
     * @return string
     */
    private function lang_getfrombrowser(array $allowed_languages, string $default_language, bool $strict_mode = true):string {

        // $_SERVER['HTTP_ACCEPT_LANGUAGE'] verwenden, wenn keine Sprachvariable mitgegeben wurde
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) $lang_variable = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        else if (PHP_SAPI === 'cli') {
            $lang_variable = substr(getEnv("LANG"), 2);
        }

        // wurde irgendwelche Information mitgeschickt?
        if (empty($lang_variable)) {
            // Nein? => Standardsprache zurückgeben
            return $default_language;
        }

        // Den Header auftrennen
        $accepted_languages = preg_split('/,\s*/', $lang_variable);

        // Die Standardwerte einstellen
        $current_lang = $default_language;
        $current_q = 0;

        // Nun alle mitgegebenen Sprachen abarbeiten
        foreach ($accepted_languages as $accepted_language) {

            // Alle Infos über diese Sprache rausholen
            $lang_match = preg_match('/^([a-z]{1,8}(?:-[a-z]{1,8})*)(?:;\s*q=(0(?:\.[0-9]{1,3})?|1(?:\.0{1,3})?))?$/i', $accepted_language, $matches);

            // war die Syntax gültig?
            if (!$lang_match) {
                // Nein? Dann ignorieren
                continue;
            }

            // Sprachcode holen und dann sofort in die Einzelteile trennen
            $lang_code = explode('-', $matches[1]);

            // Wurde eine Qualität mitgegeben?
            if (isset($matches[2])) {
                // die Qualität benutzen
                $lang_quality = (float)$matches[2];
            } else {
                // Kompabilitätsmodus: Qualität 1 annehmen
                $lang_quality = 1.0;
            }

            // Bis der Sprachcode leer ist...
            while (!empty($lang_code)) {
                // mal sehen, ob der Sprachcode angeboten wird
                if (in_array(strtolower(join('-', $lang_code)), $allowed_languages)) {
                    // Qualität anschauen
                    if ($lang_quality > $current_q) {
                        // diese Sprache verwenden
                        $current_lang = strtolower(join('-', $lang_code));
                        $current_q = $lang_quality;
                        // Hier die innere while-Schleife verlassen
                        break;
                    }
                }
                // Wenn wir im strengen Modus sind, die Sprache nicht versuchen zu minimalisieren
                if ($strict_mode) {
                    // innere While-Schleife aufbrechen
                    break;
                }
                // den rechtesten Teil des Sprachcodes abschneiden
                array_pop($lang_code);
            }
        }

        // die gefundene Sprache zurückgeben
        return $current_lang;

    }

    /**
     * Getter function for language.
     *
     * @return string
     */
    public function getLang():string {

        return $this->_lang;

    }

    /**
     * Public function for retrieving translations.
     *
     * @param string $input Name of input variable.
     *
     * @return string
     */
    public function _(string $input):string {

        if (empty($this->_translations[$input])) {
            throw new WunderhornMissingTranslation("Missing translation for $input");
        }
        return $this->_translations[$input];

    }

    /**
     * Constructor function needed for ensuring proper referal to given language
     * version.
     *
     * @return void
     */
    function __construct() {

        $availableLangs = str_replace(".php", "", array_diff(scandir(__DIR__ . "/../translations/general/"), [".", ".."]));
        $this->_lang = $this->lang_getfrombrowser($availableLangs, "en");

        include __DIR__ . "/../translations/general/{$this->_lang}.php";
        $this->_translations = $tl;

        if (file_exists(__DIR__ . "/../translations/custom/{$this->_lang}.php")) {
            include __DIR__ . "/../translations/custom/{$this->_lang}.php";
            $this->_translations = array_merge($this->_translations, $tl);
        }

    }

}
