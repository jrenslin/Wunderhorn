<?PHP
/**
 * This file collects generally, often used functions in the public frontend for museum-digital
 *
 * @file
 * @author Joshua Ramon Enslin <joshua@jrenslin.de>
 */
declare(strict_types = 1);

/**
 * Function write_get_vars prints checks for GET variables specified in the input array and returns them as a single string.
 * Useful for avoiding long blocks of links working to write meaningful links.
 *
 * @param array $input Input array.
 *                     May be a list or an associative array containing names
 *                     of GET parameters.
 *
 * @return string
 */
function write_get_vars(array $input):string {

    // Check if keys have been specified in the array (in Python terms, if it is a dict or a list).
    // If keys are not specified, write new working variable $vars with keys equaling the value.
    // $str is the string that will eventually be returned.
    $vars = [];
    $str = '';

    if (isset($input[0])) {
        foreach ($input as $value) $vars[$value] = $value;
    }
    else $vars = $input;

    // For each of the variables specified in $vars, check if a corresponding GET variable is set.
    // If so, add that to the return string.
    // The key is used in place of the original GET variable's name ($value), because some pages may have the same GET variables carry different names.
    foreach ($vars as $key => $value) {
        if (isset($GLOBALS['_GET'][$value])) $str .= '&' . $key . '=' . $GLOBALS['_GET'][$value];
    }
    return ($str);

}
