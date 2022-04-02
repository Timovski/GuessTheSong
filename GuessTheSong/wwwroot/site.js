var pageContainer = document.getElementById("page-container");
var welcomeContainer = document.getElementById("welcome-container");
var playGameButton = document.getElementById("play-game-button");

var welcomeInfoContainer = document.getElementById("welcome-info-container");
var welcomeMoreInfoLink = document.getElementById("welcome-more-info-link");
var welcomeMoreInfoContainer = document.getElementById("welcome-more-info-container");

var spotifyPremiumInfoLink = document.getElementById("spotify-premium-info-link");
var spotifyPremiumInfoContainer = document.getElementById("spotify-premium-info-container");

var controlsDiv = document.getElementById("controls-div");
var loading = document.getElementById("loading");
var togglePlayPauseButton = document.getElementById("toggle-play-pause-button");
var playPreviousSongButton = document.getElementById("play-previous-song-button");
var playNextSongButton = document.getElementById("play-next-song-button");
var showSongInfoButton = document.getElementById("show-song-info-button");
var infoSpan = document.getElementById("info-span");

var player = null;
var deviceId = null;
var trackIndex = -1;
var paused = false;
var lastAutoStart = new Date();

welcomeMoreInfoLink.onclick = function () {
    //welcomeMoreInfoLink.parentElement.removeChild(welcomeMoreInfoLink);
    welcomeMoreInfoContainer.style.display = "inline-block";
};

spotifyPremiumInfoLink.onclick = function (event) {
    event.stopPropagation();
    //spotifyPremiumInfoLink.parentElement.removeChild(spotifyPremiumInfoLink);
    spotifyPremiumInfoContainer.style.display = "inline-block";
};

playGameButton.onclick = function () {
    playGame();
};

if (accessToken) {
    updatePlayButtons();

    window.history.replaceState(null, null, window.location.pathname);

    loading.style.display = "block";
    changeBackgroundColor();
    //playGameButton.style.display = "none";

    window.onSpotifyWebPlaybackSDKReady = function () {
        player = new Spotify.Player({
            name: "Guess The Song Player",
            getOAuthToken: function (cb) { cb(accessToken); },
            volume: 1
        });

        player.addListener("ready", function (response) {
            deviceId = response.device_id;

            loading.style.display = "none";
            controlsDiv.style.display = "block";
        });

        player.addListener("not_ready", function (response) { });

        player.addListener("initialization_error", function (response) {
            console.error(response.message);
        });

        player.addListener("authentication_error", function (response) {
            console.error(response.message);
        });

        player.addListener("account_error", function (response) {
            console.error(response.message);
        });

        player.addListener("player_state_changed", function (state) {
            if (!state) {
                return;
            }

            var lastStart = new Date(lastAutoStart.getTime());
            lastStart.setSeconds(lastStart.getSeconds() + 20);

            if (!paused &&
                !state.loading &&
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
    //playGameButton.style.display = "inline-block";
    welcomeContainer.style.display = "block";
}

window.onkeydown = function (e) {
    if (e.key == "p" ||
        e.code == "KeyP" ||
        e.keyCode == 80
    ) {
        if (player) {
            togglePlayPause();
        }
    }

    if (e.key == "Backspace" ||
        e.code == "Backspace" ||
        e.keyCode == 8
    ) {
        if (player) {
            playPreviousSong();
        }
    }

    if (e.key == " " ||
        e.code == "Space" ||
        e.keyCode == 32
    ) {
        if (player) {
            playNextSong();
        }
        else {
            playGame();
        }
    }

    if (e.key == "Enter" ||
        e.code == "Enter" ||
        e.keyCode == 13
    ) {
        if (player) {
            showSongInfo();
        }
        else {
            playGame();
        }
    }
};

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

    //playGameButton.style.display = "none";
    window.location.href = authUri + authQueryParameters.toString();
}

function togglePlayPause() {
    // player.togglePlay();

    if (paused) {
        player.resume().then(function () {
            paused = false;
        });
    } else {
        player.pause().then(function () {
            paused = true;
        });
    }
}

function playNextSong() {
    infoSpan.style.display = "none";

    if (trackIndex < songs.length - 1) {
        trackIndex++;
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
        paused = false;
    }
}

function playPreviousSong() {
    infoSpan.style.display = "none";

    if (trackIndex > 0) {
        trackIndex--;
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
        paused = false;
    }
}

function showSongInfo() {
    if (trackIndex >= 0) {
        infoSpan.innerText = songs[trackIndex].artist + " - " + songs[trackIndex].name;
        infoSpan.style.display = "inline";
    }
}

function playSong(track) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function (e) { };
    xhr.onerror = function (err) { };
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) { }
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
    var backgroundColor = "hsl(" + getRandomNumber(0, 360) + ", 100%, 95%)";
    pageContainer.style.backgroundColor = backgroundColor;
    document.getElementById("header").innerText = backgroundColor;
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