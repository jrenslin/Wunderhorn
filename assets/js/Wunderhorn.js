'use strict';

class Wunderhorn {

    constructor(debug = false) {

        let _lang;
        this._debug     = debug;
        this._genres    = null;
        this._songs     = null;
        this._container = null;
        this._translations = null;
        this.loadTranslations();

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

    }

    loadTranslations(func) {

        let app = this;

        this.queryPage("/api/translations", function (resRequest) {

                let elements;
                if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                else elements = resRequest.response;
                app._translations = elements;

                if (func !== undefined) func();

        }, "json");

    }

    loadGenreInfo(func) {

        let app = this;

        this.queryPage("/api/genres", function (resRequest) {

                let elements;
                if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                else elements = resRequest.response;

                app._genres = elements;

                func();

        }, "json");

    }

    loadSongInfo(func) {

        let app = this;

        this.queryPage("/api/songs", function (resRequest) {

            let elements;
            if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
            else elements = resRequest.response;

            app._songs = elements;

            func();

        }, "json");

    }

    /**
     * Translation function.
     *
     * @param {string} toTranslate String to translate.
     *
     * @return string
     */
    _(toTranslate) {

        let app = this;

        function getTranslation(toTranslate) {
            if (app._translations[toTranslate] !== undefined) return app._translations[toTranslate];
            else console.error("There is no registered translation of: '" + toTranslate + "'");
        }

        if (this._translations !== null) {
            return getTranslation(toTranslate);
        }
        else {
            this.loadTranslations(function(e) {
                return getTranslation(toTranslate);
            });
        }

    }

    /**
     * Function queryPage queries a web page and runs the specified function over the output.
     *
     * @param string   url      URL to query.
     * @param function func     Callback function to run on the request after loading.
     * @param string   respType Response type. Optional. Defaults to "htm".
     *
     * @return boolean
     */
    queryPage(url, func, respType = "htm") {

        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.setRequestHeader("Cache-Control", "no-cache");
        request.setRequestHeader("Accept-Language", this._lang);
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

        if (this._containerOrigin === null) {
            this._containerOrigin = document.getElementsByTagName("main")[0].innerHTML;
        }

        this._container.classList.add("loading");
        this.emptyElement(this._container);

    }

    /**
     * Removes all child nodes of a DOMElement.
     *
     * @param DOMElement elem Element to empty.
     *
     * @return void
     */
    emptyElement(elem) {

        if (this._debug === true) {
            console.log("Emptying element");
        }

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

            if (app._debug === true) {
                console.log("Drawing the genre page");
            }

            app._container.classList.remove("loading");

            document.documentElement.id = "page-genres";
            document.title = app._("Genres");

            let headline = document.createElement("h1");
            headline.textContent = app._("Genres");
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

        window.history.pushState('page2', this._("Genres"), '/genres');
        if (this._genres !== null) {
            drawTheGenrePage();
        }
        else {
            this.loadGenreInfo(function() {
                drawTheGenrePage();
            });
        }

    }

    drawSongsPage() {

        let app = this;

        function drawTheSongsPage() {

            if (app._debug === true) {
                console.log("Drawing the song overview page");
            }

            app._container.classList.remove("loading");

            document.documentElement.id = "page-songs";
            document.title = app._("Songs");

            let headline = document.createElement("h1");
            headline.textContent = app._("Songs");
            app._container.appendChild(headline);

            let list = document.createElement("div");
            list.classList.add("list-image-table");

            for (let [songFile, song] of Object.entries(app._songs)) {

                let listEntry = document.createElement("a");

                // Add img
                let listImgContainer = document.createElement("div");
                let listImg = document.createElement("img");
                listImg.src = "/data/" + song.thumb;
                listImgContainer.appendChild(listImg);
                listEntry.appendChild(listImgContainer);

                // Add title and duration
                let listEntryTitle = document.createElement("span");
                listEntryTitle.classList.add("list-image-table-entry-hl");

                let listEntryTitleHl = document.createElement("span");
                listEntryTitleHl.textContent = song.metadata.title;
                listEntryTitle.appendChild(listEntryTitleHl);

                let listEntryTitleSecondary = document.createElement("span");
                listEntryTitleSecondary.textContent = song.metadata.artist;
                listEntryTitle.appendChild(listEntryTitleSecondary);

                listEntry.appendChild(listEntryTitle);

                list.appendChild(listEntry);

                listEntry.addEventListener('click', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    app.drawLoadingPage();
                    app.drawSingleSongPage(songFile);
                });

            }

            app._container.appendChild(list);

        }

        window.history.pushState('page2', this._("Songs"), '/songs');
        if (this._songs !== null) {
            drawTheSongsPage();
        }
        else {
            this.loadSongInfo(function() {
                drawTheSongsPage();
            });
        }

    }

    drawSingleSongPage(identifier) {

        let app = this;

        function drawTheSingleSongPage() {

            let song = app._songs[identifier];

            // Manipulate song information
            if (song.transcript === true) {
                song.transcript = "/api/transcript/en/" + identifier;
            }

            song.transcript_translated = {};
            for (let i = 0, max = song.transcript_translations.length; i < max; i++) {
                let transcript_lang = song.transcript_translations[i];
                song.transcript_translated[transcript_lang] = "/api/transcript-tl/" + transcript_lang + "/" + identifier;
            }
            delete song.transcript_translations;

            // Set appropriate page information
            let previousPage = location.href + "?lang=" + app._lang;
            window.history.pushState('page2', song.metadata.title, '/song/' + identifier);
            app.setNavSelected("/songs");
            app._container.classList.remove("loading");

            document.documentElement.id = "page-single-song";
            document.title = song.metadata.title;

            let player = document.createElement("section");
            player.id = "player";
            app._container.appendChild(player);

            let wPlayer = new WunderhornPlayer(song, player, "/data/", app._debug);
            wPlayer.drawMaximized();
            wPlayer._maxPlayer.addEventListener('WunderhornMaxPlayerMinimization', function(e) {
                location.href = previousPage;
            });

        }

        if (app._songs === null) {
            app.loadSongInfo(function() {
                drawTheSingleSongPage();
            });
        }
        else {
            drawTheSingleSongPage();
        }

    }

    drawSingleGenrePage(genreName) {

        let app = this;

        function drawTheSingleGenreSongList() {

            let songList = document.createElement("div");

            let songListHl = document.createElement("h2");
            songListHl.textContent = app._("Songs");
            songList.appendChild(songListHl);

            let list = document.createElement("div");
            list.classList.add("list-image-table");

            for (let [songFile, song] of Object.entries(app._songs)) {

                let listEntry = document.createElement("a");

                // Add img
                let listImgContainer = document.createElement("div");
                let listImg = document.createElement("img");
                listImg.src = "/data/" + song.thumb;
                listImgContainer.appendChild(listImg);
                listEntry.appendChild(listImgContainer);

                // Add title and duration
                let listEntryTitle = document.createElement("span");
                listEntryTitle.classList.add("list-image-table-entry-hl");

                let listEntryTitleHl = document.createElement("span");
                listEntryTitleHl.textContent = song.metadata.title;
                listEntryTitle.appendChild(listEntryTitleHl);

                let listEntryTitleSecondary = document.createElement("span");
                listEntryTitleSecondary.textContent = song.metadata.artist;
                listEntryTitle.appendChild(listEntryTitleSecondary);

                listEntry.appendChild(listEntryTitle);

                list.appendChild(listEntry);

                listEntry.addEventListener('click', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    app.drawLoadingPage();
                    app.drawSingleSongPage(songFile);
                });

            }

            songList.appendChild(list);
            app._container.appendChild(songList);

        }

        function drawTheSingleGenrePage(genreName, genreData) {

            window.history.pushState('page2', genreName, '/genre/' + genreName);
            app._container.classList.remove("loading");

            document.documentElement.id = "page-single-genre";
            document.title = genreName;

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

            if (app._songs === null) {
                app.loadSongInfo(function() {
                    drawTheSingleGenreSongList();
                });
            }
            else {
                drawTheSingleGenreSongList();
            }

        }

        if (this._genres === null) {

            this.queryPage("/api/genres", function (resRequest) {

                    let elements;
                    if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                    else elements = resRequest.response;

                app._genres = elements;
                drawTheSingleGenrePage(genreName, elements[genreName]);

            }, "json");

        }
        else drawTheSingleGenrePage(genreName, this._genres[genreName]);

    }

    /*
     *
     * Input parsing / Extended setup
     *
     */

    setNavSelected(selectedHref) {

        let app = this;
        let navigation = document.getElementById("mainNav");
        let navigationDivs = navigation.getElementsByTagName("div");

        // Loop over navigation links
        for (let i = 0, max = navigationDivs.length; i < max; i++) {

            let navDiv = navigationDivs[i];
            let navLink = navDiv.getElementsByTagName("a")[0];

            let clearedHref = navLink.href.replace(location.origin, "");

            if (selectedHref === clearedHref && navDiv.classList.contains("selected") === false) {
                navDiv.classList.add("selected");
            }
            else {
                if (navDiv.classList.contains("selected")) {
                    navDiv.classList.remove("selected")
                }
            }

        }

    }

    handlePage(inputLink) {

        if (inputLink === "/") {
            this.setNavSelected("/");
            this.drawLoadingPage();
            this._container.classList.remove("loading");
            this._container.innerHTML = this._containerOrigin;
            document.documentElement.id = "page-home";
            document.title = "Wunderhorn";
        }
        else if (inputLink === "/genres") {

            if (this._debug === true) {
                this.setNavSelected("/genres");
                this.drawLoadingPage();
                console.log("Genre page was requested");
                this.drawGenrePage();
            }

        }
        else if (inputLink.substr(0, 7) === "/genre/") {

            if (this._debug === true) {
                this.setNavSelected("/genres");
                this.drawLoadingPage();
                console.log("Single genre page was requested");
                this.drawSingleGenrePage(inputLink.substr(7));
            }

        }
        else if (inputLink === "/songs") {

            if (this._debug === true) {
                this.setNavSelected("/songs");
                this.drawLoadingPage();
                console.log("Song overview page was requested");
                this.drawSongsPage();
            }

        }
        else if (inputLink.substr(0, 6) === "/song/") {

            if (this._debug === true) {
                this.setNavSelected("/songs");
                this.drawLoadingPage();
                console.log("Single song page was requested");
                this.drawSingleSongPage(inputLink.substr(6));
            }

        }
        else {
            console.error("Unknown page: " + inputLink);
        }

    }

    setupNavigationListeners() {

        let app = this;
        let navigation = document.getElementById("mainNav");
        let navigationLinks = navigation.getElementsByTagName("a");

        // Loop over navigation links
        for (let i = 0, max = navigationLinks.length; i < max; i++) {

            let navLink = navigationLinks[i];
            let clearedHref = navLink.href.replace(location.origin, "");
            if (clearedHref.substr(0, 1) !== "/") continue;

            navLink.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                app.handlePage(clearedHref);
            });

        }

    }

    /**
     * Run: Takes current page info and translates it to actions
     */
    run() {

        this.setupNavigationListeners();
        this.handlePage(location.pathname);

    }

}

const runWunderhorn = new Wunderhorn(true);
