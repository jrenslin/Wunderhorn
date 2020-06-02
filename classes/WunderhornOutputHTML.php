<?PHP
/**
 * This file contains a class for generating HTML pages for the Wunderhorn
 * viewer.
 */
declare(strict_types = 1);
# require_once __DIR__ . "/WunderhornOutput.php";

/**
 * Class for pages.
 */
class WunderhornOutputHTML extends WunderhornOutput {

    /**
     * Function for generating the head of an HTML file, including metatags.
     *
     * @param string $curPageID   Identifier of the current page.
     * @param string $pageTitle   Title of the page.
     * @param string $description The page description. Optional.
     * @param array  $keywords    Keywords of the page. Optional.
     * @param string $image       Page image for social media. Optional.
     * @param array  $jsonLD      Json LD data. Optional.
     *
     * @return string
     */
    public function generatePageHead(string $curPageID, string $pageTitle, string $description = "", array $keywords = [], string $image = "", array $jsonLD = []):string {

        $output = '<!DOCTYPE HTML>
<html id="' . htmlspecialchars($curPageID) . '" lang="' . $this->getLang() . '">
<head>

    <script type="text/javascript" src="/assets/js/WunderhornPlayer.js"></script>
    <script type="text/javascript" src="/assets/js/Wunderhorn.js" async></script>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="shortcut icon" sizes="16x16 32x32" href="/data/img/logo/mdlogo-code-32px.png" />
    <link rel="shortcut icon" sizes="64x64" href="/data/img/logo/mdlogo-code-64px.png" />
    <link rel="apple-touch-icon" sizes="256x256" href="/data/img/logo/mdlogo-code-256px.png" />
    <meta name="theme-color" content="#FFF" />

    <link rel="stylesheet" type="text/css" href="/assets/css/Wunderhorn.css" />
    <link rel="stylesheet" type="text/css" href="/assets/css/WunderhornPlayer.css" />

    <meta name="twitter:title" content="' . htmlspecialchars($pageTitle) . '" />
    <meta property="og:title" content="' . htmlspecialchars($pageTitle) . '" />
    <title>' . $pageTitle . '</title>';

        $output .= '
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@museumdigital" />

    <meta name="description" content="' . htmlspecialchars($description) . '" />
    <meta name="twitter:description" content="' . htmlspecialchars($description) . '" />

            ';

        $output .= '
    <meta name="keywords" content="' . htmlspecialchars(implode(", ", $keywords)) . '" />';

        if (!empty($image)) {

            $output  .= '
    <meta property="twitter:image" content="' . $image . '"/>
    <meta property="og:image" content="' . $image . '"/>';

        }
        else {
            $output  .= '
    <meta property="twitter:image" content="https://www.museum-digital.org/data/img/logo/mdlogo-code-1024px.png"/>
    <meta property="og:image" content="https://www.museum-digital.org/data/img/logo/mdlogo-code-1024px.png"/>';
        }

        if (!empty($jsonLD)) {
            foreach ($jsonLD as $tScript) $output .= $tScript;
        }

        // Hreflangs

        $output .= '

</head>
<body>';

        return $output;

    }

    /**
     * Function for generating the head of an HTML file, including metatags.
     *
     * @return string
     */
    public function generatePageHeader():string {

        $output = '

        <nav id="mainNav">

            <div>
                <a href="/">' . $this->_("Home") . '</a>
            </div>
            <div>
                <a href="/genres">' . $this->_("Genres") . '</a>
            </div>
            <div>
                <a href="/songs">' . $this->_("Overview") . '</a>
            </div>

        </nav>

    ';

        return $output;

    }

    /**
     * Function for generating the head of an HTML file, including metatags.
     *
     * @return string
     */
    public function generatePageEnd():string {

        $output = "";

        // Generate footer

        // Finish

        $output .= '
</body>
</html>
';
        return $output;

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
