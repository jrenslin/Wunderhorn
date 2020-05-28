class Wunderhorn {

    constructor(debug = false) {

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

    /*
     *
     * Functions for loading information
     *
     */

    /*
     * Loading information
     *
     * @return void
     */
    loadBaseInfoFromDOM() {

        if (this._debug === true) {
            console.log("DOM loaded, extracting relevant information from DOM");
        }
        this._lang = document.documentElement.lang;

        this._container = document.getElementsByTagName("main")[0];
        this._containerOrigin = document.getElementsByTagName("main")[0];

    }

    /**
     * Function queryPage queries a web page and runs the specified function over the output.
     *
     * @param string   url      URL to query.
     * @param function func     Callback function to run on the request after loading.
     * @param boolean  debug    Enable / disable debug mode. Optional.
     * @param string   respType Response type. Optional. Defaults to "htm".
     *
     * @return boolean
     */
    queryPage(url, func, respType = "htm") {

        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.setRequestHeader("Cache-Control", "no-cache");
        request.responseType = respType;
        request.send();
        request.onload = function() {
            func(request);
        };

    }

    /*
     *
     * DOM manipulation
     *
     */

    drawLoadingPage() {

        this._container.classList.add("loading");
        this.emptyElement(this._container);

    }

    emptyElement(elem) {

        while (elem.lastElementChild) {
            elem.removeChild(elem.lastElementChild);
        }

    }

    /*
     *
     * Pages
     *
     */

    drawGenrePage() {

        let app = this;

        function drawTheGenrePage() {

            let headline = document.createElement("h1");
            headline.textContent = "Genres"; // String literal
            app._container.appendChild(headline);

            let list = document.createElement("div");
            list.classList.add("cardList");

            for (let [genreName, genreData] of Object.entries(app._genres)) {

                let genreCard = document.createElement("a");
                genreCard.classList.add("card");
                genreCard.href = "/genre/" + genreName;

                let genreCardThumb = document.createElement("img");
                genreCardThumb.src = "/data/" + genreData.thumb;
                genreCard.appendChild(genreCardThumb);

                let genreCardMeta = document.createElement("div");

                let genreCardHl = document.createElement("h2");
                genreCardHl.textContent = genreName;
                genreCardMeta.appendChild(genreCardHl);

                genreCard.appendChild(genreCardMeta);

                list.appendChild(genreCard);

                genreCard.addEventListener('click', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    app.drawLoadingPage();
                    app.drawSingleGenrePage(genreName);
                });

            }

            app._container.appendChild(list);

        }

        if (this._genres !== null) {
            drawTheGenrePage();
        }

        // window.history.pushState('page2', 'Genres', '/genres');// String literal on arg 2

        this.queryPage("/api/genres", function (resRequest) {

                let elements;
                if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                else elements = resRequest.response;

                app._container.classList.remove("loading");
                app._genres = elements;

                drawTheGenrePage();

        }, "json");

    }

    drawSingleGenrePage(genreName) {

        let app = this;

        function drawTheGenrePage(genreName, genreData) {

            window.history.pushState('page2', genreName, '/genre/' + genreName);// String literal on arg 2
            app._container.classList.remove("loading");

            let hl = document.createElement("h1");
            hl.textContent = genreName;
            app._container.appendChild(hl);

            // Div for about information

            let mainAboutDiv = document.createElement("div");
            mainAboutDiv.classList.add("entry-about");

            let mainImgDiv = document.createElement("div");
            mainImgDiv.classList.add("entry-img-div");

            let mainImg = document.createElement("img");
            mainImg.src = "/data/" + genreData.thumb;
            mainImgDiv.appendChild(mainImg);
            mainAboutDiv.appendChild(mainImgDiv);

            let aboutDiv = document.createElement("div");
            aboutDiv.classList.add();

            aboutDiv.textContent = genreData.description;
            mainAboutDiv.appendChild(aboutDiv);

            app._container.appendChild(mainAboutDiv);

        }

        if (this._genres === null) {

            this.queryPage("/api/genres", function (resRequest) {

                    let elements;
                    if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                    else elements = resRequest.response;

                app._genres = elements;
                drawTheGenrePage(genreName, elements[genreName]);

            }, "json");

        }
        else drawTheGenrePage(genreName, this._genres[genreName]);

    }

    /*
     *
     * Input parsing / Extended setup
     *
     */

    /**
     * Run: Takes current page info and translates it to actions
     */
    run() {

        if (location.pathname === "/") {}
        else if (location.pathname === "/genres") {

            if (this._debug === true) {
                this.drawLoadingPage();
                console.log("Genre page was requested");
                this.drawGenrePage();
            }

        }
        else if (location.pathname.substr(0, 7) === "/genre/") {

            if (this._debug === true) {
                this.drawLoadingPage();
                console.log("Single genre page was requested");
                this.drawSingleGenrePage(location.pathname.substr(7));
            }

        }

    }

}

const runWunderhorn = new Wunderhorn(true);
