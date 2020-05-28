<?PHP
declare(strict_types = 1);

/**
 * Exception to be thrown if a translation was not available.
 */
class WunderhornMissingTranslation extends Exception {

    /**
     * Error message.
     *
     * @return string
     */
    public function errorMessage() {

        //error message
        $errorMsg = 'Missing translation: ' . $this->getMessage() . '.';
        return $errorMsg;

    }

}
