class WunderhornPlayer {

    constructor(song, player, basedir, debug = false) {

        let _lang;
        this._debug = debug;
        this._song  = song;
        this._basedir = basedir;
        this._player = player;
        this._maxPlayer = null;
        this._audio = null;

        this._player.classList.add("WhPlayer");
        this._player.classList.add("WhPlayerMain");

        this._audio = document.createElement("audio");

        let audioElemSrc = document.createElement("source");
        audioElemSrc.type = song.mimetype;
        audioElemSrc.src = basedir + song.filename;
        this._audio.appendChild(audioElemSrc);

        this._player.appendChild(this._audio);

        this.drawMainPlayer();

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

    drawMaximized() {

        this._maxPlayer = document.createElement("section");
        this._maxPlayer.classList.add("WhPlayer");
        this._maxPlayer.classList.add("WhPlayerMax");

        // Header
        let maxPlayerHeader = document.createElement("header");
        this._maxPlayer.appendChild(maxPlayerHeader);

        // Body
        let maxPlayerBody = document.createElement("div");
        maxPlayerBody.classList.add("WhPlayerMax-body");
        this._maxPlayer.appendChild(maxPlayerBody);

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
                e.preventDefault(); e.stopPropagation();
                app._maxPlayer = null;
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
