var pageContainer = document.getElementById("page-container");
var welcomeContainer = document.getElementById("welcome-container");
var playGameButton = document.getElementById("play-game-button");

var welcomeMoreInfoLink = document.getElementById("welcome-more-info-link");
var welcomeMoreInfoContainer = document.getElementById("welcome-more-info-container");
var welcomeMoreInfoContainerParagraph = document.getElementById("welcome-more-info-container-paragraph");

var spotifyPremiumInfoLink = document.getElementById("spotify-premium-info-link");
var spotifyPremiumInfoContainer = document.getElementById("spotify-premium-info-container");

var emptyContainer = document.getElementById("empty-container");
var controlsContainer = document.getElementById("controls-container");

var togglePlayPauseButton = document.getElementById("toggle-play-pause-button");
var playPreviousSongButton = document.getElementById("play-previous-song-button");
var playNextSongButton = document.getElementById("play-next-song-button");
var showSongInfoButton = document.getElementById("show-song-info-button");

var songInfo = document.getElementById("song-info");

//var touchstartX = 0;
//var touchendX = 0;
//var touchstartY = 0;
//var touchendY = 0;

var lastHue = 0;
var player = null;
var deviceId = null;
var trackIndex = -1;
var lastAutoStart = new Date();

welcomeMoreInfoLink.onclick = function () {
    welcomeMoreInfoLink.style.display = "none";
    welcomeMoreInfoContainer.style.display = "inline";
    welcomeMoreInfoContainerParagraph.style.display = "inline-block";
};

spotifyPremiumInfoLink.onclick = function (event) {
    event.stopPropagation();
    spotifyPremiumInfoContainer.style.display = "inline-block";
};

playGameButton.onclick = function () {
    playGame();
};

if (accessToken) {
    updatePlayButtons();

    window.history.replaceState(null, null, window.location.pathname);

    emptyContainer.style.display = "table-row-group";
    emptyContainer.children[0].children[0].children[0].textContent = "Loading...";
    changeBackgroundColor();

    window.onSpotifyWebPlaybackSDKReady = function () {
        player = new Spotify.Player({
            name: "Guess The Song Player",
            getOAuthToken: function (cb) { cb(accessToken); },
            volume: 1
        });

        player.addListener("ready", function (response) {
            deviceId = response.device_id;

            emptyContainer.style.display = "none";
            controlsContainer.style.display = "table-row-group";

            playNextSong();
        });

        player.addListener("not_ready", function (response) { });

        player.addListener("initialization_error", function (response) { });

        player.addListener("authentication_error", function (response) { });

        player.addListener("account_error", function (response) {
            emptyContainer.children[0].children[0].children[0].textContent = "Account error: " + response.message;
        });

        player.addListener("player_state_changed", function (state) {
            if (!state) {
                return;
            }

            updatePlayPauseButton(state.paused);

            var lastStart = new Date(lastAutoStart.getTime());
            lastStart.setSeconds(lastStart.getSeconds() + 20);

            if (!state.loading &&
                state.paused &&
                state.track_window.previous_tracks[0] &&
                state.track_window.previous_tracks[0].id === state.track_window.current_track.id &&
                state.timestamp > lastStart.getTime()) {
                playNextSong();
                lastAutoStart = new Date(state.timestamp);
            }
        });

        togglePlayPauseButton.onclick = function () {
            togglePlayPause();
        };

        playPreviousSongButton.onclick = function () {
            playPreviousSong();
        };

        playNextSongButton.onclick = function () {
            playNextSong();
        };

        showSongInfoButton.onclick = function () {
            showSongInfo();
        };

        player.connect();
    };
} else {
    emptyContainer.style.display = "none";
    welcomeContainer.style.display = "table-row-group";
}

window.onkeydown = function (e) {
    if (e.key == "p" || e.key == "ArrowUp" ||
        e.code == "KeyP" || e.code == "ArrowUp" ||
        e.keyCode == 80 || e.keyCode == 38
    ) {
        if (player) {
            togglePlayPause();
        }
    }

    if (e.key == "Backspace" || e.key == "ArrowLeft" ||
        e.code == "Backspace" || e.code == "ArrowLeft" ||
        e.keyCode == 8 || e.keyCode == 37
    ) {
        if (player) {
            playPreviousSong();
        }
    }

    if (e.key == " " || e.key == "ArrowRight" ||
        e.code == "Space" || e.code == "ArrowRight" ||
        e.keyCode == 32 || e.keyCode == 39
    ) {
        if (player) {
            playNextSong();
        }
        else {
            playGame();
        }
    }

    if (e.key == "Enter" || e.key == "ArrowDown" ||
        e.code == "Enter" || e.code == "ArrowDown" ||
        e.keyCode == 13 || e.keyCode == 40
    ) {
        if (player) {
            showSongInfo();
        }
        else {
            playGame();
        }
    }
};

//window.ontouchstart = function (e) {
//    touchstartX = e.changedTouches[0].screenX;
//    touchstartY = e.changedTouches[0].screenY;
//};

//window.ontouchend = function (e) {
//    touchendX = e.changedTouches[0].screenX;
//    touchendY = e.changedTouches[0].screenY;

//    if (touchendX > touchstartX + 100) {
//        if (player) {
//            playNextSong();
//        }
//        else {
//            playGame();
//        }
//        return;
//    }

//    if (touchendY > touchstartY + 100) {
//        if (player) {
//            showSongInfo();
//        }
//        else {
//            playGame();
//        }
//        return;
//    }

//    if (touchendX < touchstartX - 100) {
//        if (player) {
//            playPreviousSong();
//        }
//        return;
//    }

//    if (touchendY < touchstartY - 100) {
//        if (player) {
//            togglePlayPause();
//        }
//        return;
//    }
//};

function playGame() {
    var generateRandomString = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var scope = "streaming user-read-email user-read-private";
    var state = generateRandomString(16);

    var authQueryParameters = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state
    });

    window.location.href = authUri + authQueryParameters.toString();
}

function togglePlayPause() {
    player.togglePlay();
    click(togglePlayPauseButton);
}

function updatePlayPauseButton(paused) {
    if (paused) {
        togglePlayPauseButton.children[0].className = "icon-play";
        togglePlayPauseButton.children[1].children[0].textContent = "Play";
    } else {
        togglePlayPauseButton.children[0].className = "icon-pause";
        togglePlayPauseButton.children[1].children[0].textContent = "Pause";
    }
}

function playNextSong() {
    click(playNextSongButton);

    if (trackIndex < songs.length - 1) {
        trackIndex++;
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
        hideSongInfo();
    }
}

function playPreviousSong() {
    click(playPreviousSongButton);

    if (trackIndex > 0) {
        trackIndex--;
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
        hideSongInfo();
    }
}

function showSongInfo() {
    click(showSongInfoButton);

    songInfo.innerText = songs[trackIndex].artist + " - " + songs[trackIndex].name;
    songInfo.classList.remove("song-info-hidden");
    songInfo.classList.add("song-info-visible");
}

function hideSongInfo() {
    songInfo.classList.remove("song-info-visible");
    songInfo.classList.add("song-info-hidden");
}

function playSong(track) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function (e) { };
    xhr.onerror = function (err) { };
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) { }

        if (xhr.readyState === 4 && xhr.status === 403) {
            songs.splice(trackIndex, 1);
            trackIndex--;
            playNextSong();
        }
    };

    xhr.open("PUT", playUri + deviceId, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
    xhr.send(JSON.stringify({ uris: ["spotify:track:" + track] }));

    changeBackgroundColor();
}

function updatePlayButtons() {
    if (trackIndex >= songs.length - 1) {
        playNextSongButton.classList.add("disabled");
    } else {
        playNextSongButton.classList.remove("disabled");
    }

    if (trackIndex < 1) {
        playPreviousSongButton.classList.add("disabled");
    } else {
        playPreviousSongButton.classList.remove("disabled");
    }
}

function changeBackgroundColor() {
    var hue = getRandomNumber(0, 360);

    var from = lastHue <= 50 ? 0 : lastHue - 50;
    var to = lastHue >= 310 ? 360 : lastHue + 50;
    if (hue >= from && hue <= to) {
        hue = hue <= 180 ? hue + 180 : hue - 180;
    }

    var backgroundColor = "hsl(" + hue + ", 100%, 80%)";
    pageContainer.style.backgroundColor = backgroundColor;
    lastHue = hue;
};

function log(code) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/Home/Log", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ Code: code }));
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function click(button) {
    button.style.webkitTransitionDuration = "0s";
    button.style.mozTransitionDuration = "0s";
    button.style.oTransitionDuration = "0s";
    button.style.transitionDuration = "0s";
    button.style.backgroundColor = "white";

    setTimeout(function () {
        button.style.webkitTransitionDuration = "0.1s";
        button.style.mozTransitionDuration = "0.1s";
        button.style.oTransitionDuration = "0.1s";
        button.style.transitionDuration = "0.1s";
        button.style.removeProperty("background-color");
    }, 20);
}