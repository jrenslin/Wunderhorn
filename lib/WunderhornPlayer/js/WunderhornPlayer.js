'use strict';

class WunderhornPlayer {

    constructor(song, player, basedir, debug = false) {

        this._lang = document.documentElement.getAttribute("lang");
        this._debug = debug;
        this._song  = song;
        this._basedir = basedir;
        this._player = player;
        this._maxPlayer = null;
        this._maxPlayerBody = null;
        this._audio = null;

        this._transcript = null;
        this._transcript_translated = null;

        this.loadTranscript();
        this.loadTranscriptTL();

        this._player.classList.add("WhPlayer");
        this._player.classList.add("WhPlayerMain");

        this._audio = document.createElement("audio");

        let audioElemSrc = document.createElement("source");
        audioElemSrc.type = song.mimetype;
        audioElemSrc.src = basedir + song.filename;
        this._audio.appendChild(audioElemSrc);

        this._player.appendChild(this._audio);

        this.drawMainPlayer();

        this.WunderhornMaxPlayerMinimizationEvent = new Event('WunderhornMaxPlayerMinimization');

    }

    /*
     *
     * Loading more information
     *
     */

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

    loadTranscript(func = null) {

        // Only do anything if transcript hasn't been loaded yet
        if (this._transcript === null) {

            let app = this;
            this.queryPage(app._song.transcript, function (resRequest) {

                let elements;
                if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                else elements = resRequest.response;

                app._transcript = elements;

                if (func !== null) {
                    func();
                }

            }, "json");

        }
        else {
            if (func !== null) {
                func();
            }
        }

    }

    loadTranscriptTL(func = null) {

        // Only do anything if transcript hasn't been loaded yet
        if (this._transcript_translated === null) {

            let app = this;

            if (this._song.transcript_translated[this._lang] !== undefined && this._song.transcript_translated[this._lang] !== null) {

                this.queryPage(app._song.transcript, function (resRequest) {

                    let elements;
                    if (typeof resRequest.response === "string" || resRequest.response instanceof String) elements = JSON.parse(resRequest.response);
                    else elements = resRequest.response;

                    app._transcript_translated = elements;

                    if (func !== null) {
                        func();
                    }

                }, "json");

            }
            else if (func !== null) {
                func();
            }

        }
        else if (func !== null) {
            func();
        }


    }

    /*
     * Audio controls
     */

    audioTogglePlayStatus() {

        this._player.classList.toggle("playing");
        if (this._maxPlayer !== null) {
            this._maxPlayer.classList.toggle("playing");
        }

        if (this._audio.paused === true) {
            this._audio.play();
        }
        else {
            this._audio.pause();
        }

    }

    /*
     *
     * DOM manipulation
     *
     */

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

    /**
     * Provides a tabular overview of song metadata in a DOM node, that can be
     * used in the maximized player.
     *
     * @return DOMElement
     */
    generateMaximizedTabMeta() {

        let tabMeta = document.createElement("section");

        let tabMetaHl = document.createElement("h3");
        tabMetaHl.textContent = "Meta";                 // TODO: String literal
        tabMeta.appendChild(tabMetaHl);

        let metaTable = document.createElement("table");

        function generateSimpleTableRow(thText, tdText) {

            let tr = document.createElement("tr");

            let th = document.createElement("th");
            th.textContent = thText;
            tr.appendChild(th);

            let td = document.createElement("td");
            td.textContent = tdText;
            tr.appendChild(td);

            return tr;

        }

        // TODO: String literals
        if (this._song.metadata.title !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Title", this._song.metadata.title));
        }
        if (this._song.metadata.artist !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Artist", this._song.metadata.artist));
        }
        if (this._song.metadata.album !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Album", this._song.metadata.album));
        }
        if (this._song.metadata.date !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Date", this._song.metadata.date));
        }
        if (this._song.metadata.publisher !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Publisher", this._song.metadata.publisher));
        }
        if (this._song.metadata.genre !== undefined) {
            metaTable.appendChild(generateSimpleTableRow("Genre", this._song.metadata.genre));
        }

        tabMeta.appendChild(metaTable);

        this._maxPlayerBody.appendChild(tabMeta);

    }

    /**
     * Creates transcript tab
     *
     */
    generateMaximizedTabTranscript() {

        // Thanks to Tejas Shah on stack overflow:
        // https://stackoverflow.com/a/31987330
        function scrollTo(element, to, duration) {
            if (duration <= 0) return;
            var difference = to - element.scrollTop;
            var perTick = difference / duration * 10;

            setTimeout(function() {
                element.scrollTop = element.scrollTop + perTick;
                if (element.scrollTop === to) return;
                scrollTo(element, to, duration - 10);
            }, 10);
        }


        let app = this;

        let transcriptTab = document.createElement("section");

        let transcriptLines = document.createElement("ul");
        transcriptLines.classList = "WhPlayerTranscriptLines";
        transcriptTab.appendChild(transcriptLines);

        function drawTranscriptLines() {

            for (let i = 0, max = app._transcript.length; i < max; i++) {

                let lineData = app._transcript[i];

                let li = document.createElement("li");
                li.id = "transcriptLine" + lineData.start_ms;
                li.textContent = lineData.text;

                if (app._transcript_translated !== null && app._transcript_translated[i] !== undefined) {

                    let lineTL = document.createElement("span");
                    lineTL.classList.add("WhPlayerTranscriptTL");
                    lineTL.textContent = app._transcript_translated[i].text;
                    li.appendChild(lineTL);

                }

                transcriptLines.appendChild(li);

            }

            // Bind scrolling
            let lastTime = 0;
            let lastElem = 0;
            app._audio.addEventListener('timeupdate', (event) => {

                let currentTimeMs = Math.round(app._audio.currentTime * 1000);
                lastTime = currentTimeMs;

                if (app._transcript[0].start_ms > currentTimeMs) return;

                let currentElem;
                for (let i = 0, max = app._transcript.length; i < max; i++) {

                    let lineData = app._transcript[i];
                    if (lineData.start_ms < currentTimeMs && currentTimeMs < lineData.end_ms) {
                        currentElem = i;
                        break;
                    }

                }

				// Make this the selected transcript line
				if (lastElem !== currentElem || lastElem === 0) {

					let target = document.getElementById("transcriptLine" + app._transcript[currentElem].start_ms);
					let selectedThusFar = document.getElementsByClassName("WhPlayerSelectedTranscriptLine")[0];
					if (selectedThusFar !== undefined && selectedThusFar !== null) {
						selectedThusFar.classList.remove("WhPlayerSelectedTranscriptLine");
					}
					target.classList.add("WhPlayerSelectedTranscriptLine");

					scrollTo(transcriptLines, target.offsetTop - 200, 250);
					lastElem = currentElem;

				}

            });

        }

        function completeLoadingTranscript() {
            app.loadTranscriptTL(drawTranscriptLines);
        }

        this.loadTranscript(completeLoadingTranscript);

        this._maxPlayerBody.appendChild(transcriptTab);

    }

    /**
     * Central function for generating and drawing the maximized player.
     *
     * @return void
     */
    drawMaximized() {

        let app = this;

        console.log(this._song);

        this._maxPlayer = document.createElement("section");
        this._maxPlayer.classList.add("WhPlayer");
        this._maxPlayer.classList.add("WhPlayerMax");

        // Header
        let maxPlayerHeader = document.createElement("header");
        this._maxPlayer.appendChild(maxPlayerHeader);

        // Body
        this._maxPlayerBody = document.createElement("div");
        this._maxPlayerBody.classList.add("WhPlayerMax-body");
        this._maxPlayer.appendChild(this._maxPlayerBody);

        let headerOptionTranscript = document.createElement("a");
        headerOptionTranscript.textContent = "Transcript"; // TODO: String literal
        headerOptionTranscript.addEventListener('click', function(e) {
            app.emptyElement(app._maxPlayerBody);
            app.generateMaximizedTabTranscript();
        });
        maxPlayerHeader.appendChild(headerOptionTranscript);

        let headerOptionMeta = document.createElement("a");
        headerOptionMeta.textContent = "Meta"; // TODO: String literal
        headerOptionMeta.addEventListener('click', function(e) {
            app.emptyElement(app._maxPlayerBody);
            app.generateMaximizedTabMeta();
        });
        maxPlayerHeader.appendChild(headerOptionMeta);

        // Default: Transcript view
        this.generateMaximizedTabTranscript();

        // Footer
        let maxPlayerFooter = document.createElement("footer");

        maxPlayerFooter.appendChild(this.generateMainPlayerImage());
        maxPlayerFooter.appendChild(this.generateMainPlayerAbout(true));


        this._maxPlayer.appendChild(maxPlayerFooter);

        // Append player to body
        document.body.appendChild(this._maxPlayer);

    }

    generateMainPlayerImage() {

        let app = this;

        // Draw img
        let mainImgArea = document.createElement("div");
        mainImgArea.classList.add("WhPlayerMain-image");

        let mainImg = document.createElement("img");
        mainImg.src = this._basedir + this._song.thumb;
        mainImgArea.appendChild(mainImg);

        mainImg.addEventListener('click', function(e) {
            app.audioTogglePlayStatus();
        });

        return mainImgArea;

    }

    minimizeMaxPlayer(e) {
        e.preventDefault(); e.stopPropagation();
        app.emptyElement(app._maxPlayer);
        app._maxPlayer.parentElement.removeChild(app._maxPlaye);
        app._maxPlayer = null;
    }

    generateMainPlayerAbout(maximizedState) {

        let app = this;

        // Draw minor meta information

        let aboutArea = document.createElement("div");
        aboutArea.classList.add("WhPlayerMain-about");

        let hl = document.createElement("h3");
        hl.textContent = this._song.metadata.title;
        aboutArea.appendChild(hl);

        // Duration line

        let durationLine = document.createElement("div");
        durationLine.classList.add("WhPlayer-duration");

        let durationInput = document.createElement("input");
        durationInput.type = "range";

        durationInput.min = "0";
        durationInput.value = "0";
        app._audio.addEventListener('loadedmetadata', function(e) {
            durationInput.max = app._audio.duration;
        });
        durationInput.step = "0.00001";
        durationLine.appendChild(durationInput);

        aboutArea.appendChild(durationLine);

        // Menu

        let withHours = false;
        if (this._song.duration > 3600) withHours = true;

        function getTimeString(input) {

            function padTwoDigits(inputInt) {
                if (inputInt.toString().length === 1) return "0" + inputInt;
                else return inputInt;
            }

            if (withHours === true) {
                let hours = Math.floor(input / 3600);
                return padTwoDigits(hours) + ":" + padTwoDigits(Math.floor((input % 3600) / 60)) + ":" + padTwoDigits(Math.ceil((input % 3600) % 60));
            }
            else return Math.floor(input / 60) + ":" + Math.ceil(input % 60);

        }

        let mainPlayerMenu = document.createElement("div");
        mainPlayerMenu.classList.add("WhPlayer-options");

        let mainPlayerMenuLeft = document.createElement("div");
        mainPlayerMenuLeft.classList.add("WhPlayer-options-left");

        let indicatorCurrent = document.createElement("input");
        indicatorCurrent.type = "text"; // Not number, to not show number controls
        if (withHours) indicatorCurrent.value = "00:00:00";
        else indicatorCurrent.value = "00:00";
        indicatorCurrent.disabled = true;
        mainPlayerMenuLeft.appendChild(indicatorCurrent);

        let indicatorSeparator = document.createElement("span");
        indicatorSeparator.classList.add("WhPlayer-options-separator");
        indicatorSeparator.textContent = " / ";
        mainPlayerMenuLeft.appendChild(indicatorSeparator);

        let indicatorEnd = document.createElement("input");
        indicatorEnd.type = "text"; // Not number, to not show number controls
        indicatorEnd.value = getTimeString(this._song.duration);
        indicatorEnd.disabled = true;
        mainPlayerMenuLeft.appendChild(indicatorEnd);

        mainPlayerMenu.appendChild(mainPlayerMenuLeft);

        let mainPlayerMenuRight = document.createElement("div");
        mainPlayerMenuRight.classList.add("WhPlayer-options-right");

        if (maximizedState === false) {

            let maximizeButton = document.createElement("a");
            maximizeButton.href = "#";
            maximizeButton.textContent = "Maximize"; // String literal, use icon
            maximizeButton.addEventListener("click", function(e) {
                e.preventDefault(); e.stopPropagation();
                app.drawMaximized();
            });
            mainPlayerMenuRight.appendChild(maximizeButton);

            mainPlayerMenu.appendChild(mainPlayerMenuRight);

        }
        else {

            let minimizeButton = document.createElement("a");
            minimizeButton.href = "#";
            minimizeButton.textContent = "minimize"; // String literal, use icon
            minimizeButton.addEventListener("click", function(e) {
                app._maxPlayer.dispatchEvent(app.WunderhornMaxPlayerMinimizationEvent);
            });


            mainPlayerMenuRight.appendChild(minimizeButton);

            mainPlayerMenu.appendChild(mainPlayerMenuRight);

        }

        aboutArea.appendChild(mainPlayerMenu);

        this._audio.addEventListener('timeupdate', (event) => {
            durationInput.value = this._audio.currentTime;
            indicatorCurrent.value = getTimeString(this._audio.currentTime);
            let currentPercent = 100 / durationInput.max * durationInput.value;
            durationInput.style.background = "linear-gradient(90deg, #e13916 " + currentPercent + "%, #ff6f48 " + currentPercent + "%, #ff6f48 100%)";
        });
        durationInput.addEventListener('change', function(e) {
            app._audio.currentTime = durationInput.value;
        });

        return aboutArea;

    }

    drawMainPlayer() {

        let app = this;

        this._player.appendChild(this.generateMainPlayerImage());
        this._player.appendChild(this.generateMainPlayerAbout(false));

    }

}
