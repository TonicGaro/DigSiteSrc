// reserve 10 % loading for bootstrapping
var INITIAL_LOAD_PERCENT = 10;

var fileLoadErrors = [];
var initialized = false;

function initCAGame() {
    // without setting the domain here we will have CORS error when accessing the parents variables
    var arrDomain = location.hostname.split('.');
    if (arrDomain.length > 2 && !/amazonaws/.test(location.hostname) && !/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/.test(location.hostname)) {
        arrDomain.shift();
        document.domain = arrDomain.join('.');
    }

    // set retry loader hook
    window.preloader = {};
    var fileCounter = 0;
    var files = ['../shared/lib/phaser.min.js', 'js/main.js'];
    var retries = parent.window.gameBridge ? parent.window.gameBridge.info.numberOfRetries : 1;
    var retriesRemaining = retries;

    var loadNext = function(_retriesRemaining) {
        if(++fileCounter < files.length) {
            loadJS(files[fileCounter], loadNext, _retriesRemaining);
        }
    }

    loadJS(files[fileCounter], loadNext, retries);
}

function getTrimmedName(name, maxLength) {
    var nameEntry = name;
    if (nameEntry.length > maxLength) {
        nameEntry = nameEntry.substring(0, maxLength) + '…';
    }

    return nameEntry;
}

function loadJS(url, implementationCode, retriesRemaining){
    var scriptTag = document.createElement('script');
    var onError = function() {
        console.warn('retrying load', url);
        if (retriesRemaining) {
            loadJS(url, implementationCode, --retriesRemaining);
        } else {
            console.error('unable to load', url);
        }
    }
    scriptTag.src = url;
    scriptTag.onerror = onError;
    scriptTag.onload = implementationCode;
    if (implementationCode) {
        scriptTag.onreadystatechange = implementationCode.bind(this, retriesRemaining);
    }

    document.getElementsByTagName('head')[0].appendChild(scriptTag);
};

function findScoreIndex(score, leaderboardText, scoreAttribute, studentId) {
    var scoreIndex = -1;
    var i;
    if (leaderboardText != null && leaderboardText[scoreAttribute] != null) {
        var len = leaderboardText[scoreAttribute].length;
        for (i=0; i<len; i++) {
            if (leaderboardText[scoreAttribute][i].studentId === studentId && leaderboardText[scoreAttribute][i].score == score)
                scoreIndex = i;
        }
    }

    return scoreIndex;
}

initCAGame();

// retry hooks
function initRetryLoaders(game, context, cb) {
    var retries = parent.window.gameBridge ? parent.window.gameBridge.info.numberOfRetries : 1;
    game.load.onFileError.add(fileError, context);
    game.load.onLoadComplete.add(loadComplete.bind(context, cb, retries, game), context);
}

function fileError(key, file) {
    console.warn('file load error', key, file)
    fileLoadErrors.push(file);

}

function loadComplete(cb, retries, game) {
    if (fileLoadErrors.length) {
        console.warn("Load Complete w/ errors", retries, ' retries remaining');
        if (retries) {
            retryLoadFailures(cb, --retries, game);
        }
    } else {
        if (cb) {
            cb();
        }
    }
}

function retryLoadFailures(cb, retries, game){
    loader = new Phaser.Loader(game);
    loader.onFileError.add(fileError, this);
    loader.onLoadComplete.add(loadComplete.bind(this, cb, retries, game), this);
    var timestamp = Date.now().toString();

    while (fileLoadErrors.length) {
        var file = fileLoadErrors.pop();
        var url = file.url + '?ts=' + timestamp
        console.log('retrying', file)
        if (file.type === 'spritesheet') {
            loader[file.type](file.key, url, file.frameWidth, file.frameHeight, file.frameMax);
        } else {
            loader[file.type](file.key, url);
        }
    };
    loader.start();
}
