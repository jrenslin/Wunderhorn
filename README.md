# Draft for a metadata-based media station using web technologies

This web app is a draft for creating a web audio player including an encompassing website from audio metadata. Transcriptions are displayed from WebVTT sources.

## Components

### Audio files

Audio files are to be ordered by the folder structure. Genererally, they are stored in a subfolder `data` respective to the root directory of the repository. Within this subfolder, a subdirectory for each audio file should be created, within which additional files around the audio files can be entered (e.g. transcriptions in WebVTT files or the album artwork).
An example folder structure may look as follows:

```
.
├── fg077-organisationsforschung
│  ├── fg077-organisationsforschung.en.vtt
│  ├── fg077-organisationsforschung.jpg
│  ├── fg077-organisationsforschung.mp3
│  └── fg077-organisationsforschung.vtt
```

### Command Line Interface

The command line interface extracts and caches the audio files' metadata. It needs to be called after a new audio file has been added. It can be called as follows:

```
$ php cli.php

Command line interface to Wunderhorn music player

The following options are available:
  load-genres   Generates genre cache based on genre metadata
  load-songs    Generates songs cache with all the audio files' metadata
```

### Web App

The web app consists of a basic shell (`index.php`). All logic is handled in JavaScript (`assets/js/Wunderhorn.js`) and based on APIs written in PHP. `Wunderhorn.js` is responsive to the URLs provided to the web app and opens the corresponding page.

### Player

A very basic, multi-language audio player is used for single audio files' pages and displaying transcriptions if available. It is written independently from the rest of the code, but can - for the time being - be found in this repository (`lib/WunderhornPlayer/`).

## Dependencies

- Apache
- PHP
- ffmpeg
