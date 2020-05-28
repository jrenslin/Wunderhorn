<?PHP
/**
 * Start page of simple music browser.
 *
 * @author Joshua Ramon Enslin <joshua@museum-digital.de>
 */
declare(strict_types = 1);

# error_reporting(E_ALL);
ini_set("display_errors", "1");

require __DIR__ . "/inc/provideEnv.php";

$page = new WunderhornOutputHTML();

// Start HTML output
echo $page->generatePageHead("load", "load :: AML Music", "A transcript-focused music player", [$page->_("Music"), $page->_("Transcripts")]);
echo $page->generatePageHeader();

echo '
<main>
    <p>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
</main>
';

// End
echo $page->generatePageEnd();
