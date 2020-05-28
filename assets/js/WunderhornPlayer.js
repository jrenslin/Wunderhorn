class WunderhornPlayer {

    constructor(, debug = false) {

        let _lang;
        this._debug     = debug;
        this._genres    = null;
        this._songs     = null;
        this._container = null;

        this._containerOrigin = null;

        // Load information from HTML once DOM is loaded
        if(document.readyState === "complete" || document.readyState === "interactive") {
            this.loadBaseInfoFromDOM();
        }
        else {
            document.addEventListener("DOMContentLoaded", function(event) {
                this.loadBaseInfoFromDOM();
            });
        }

        // For test: Empty page
        this.run();

    }

}
