var playGameButton = document.getElementById("play-game-button");
var playPauseButton = document.getElementById("play-pause-button");
var playNextSongButton = document.getElementById("play-next-song-button");
var playPreviousSongButton = document.getElementById("play-previous-song-button");
var showInfoButton = document.getElementById("show-info-button");
var infoSpan = document.getElementById("info-span");
var controlsDiv = document.getElementById("controls-div");
var loading = document.getElementById("loading");

var deviceId = null;
var trackIndex = -1;
var paused = false;
var lastAutoStart = new Date();

playGameButton.onclick = function () {
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

    playGameButton.style.display = "none";
    window.location.href = authUri + authQueryParameters.toString();
};

if (accessToken) {
    updatePlayButtons();

    window.history.replaceState(null, null, window.location.pathname);
    loading.style.display = "block";
    playGameButton.style.display = "none";

    window.onSpotifyWebPlaybackSDKReady = function () {
        var player = new Spotify.Player({
            name: "Guess The Song Player",
            getOAuthToken: function (cb) { cb(accessToken); },
            volume: 1
        });

        player.addListener("ready", function (response) {
            deviceId = response.device_id;
            console.log("Ready with Device ID", response.device_id);

            controlsDiv.style.display = "block";
            loading.style.display = "none";
        });

        player.addListener("not_ready", function (response) {
            console.log("Device ID has gone offline", response.device_id);
        });

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

        playPauseButton.onclick = function () {
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
        };

        playNextSongButton.onclick = function () {
            playNextSong();
        };

        playPreviousSongButton.onclick = function () {
            playPreviousSong();
        };

        showInfoButton.onclick = function () {
            infoSpan.innerText = songs[trackIndex].artist + " - " + songs[trackIndex].name;
            infoSpan.style.display = "inline";
        };

        player.connect();
    };
} else {
    playGameButton.style.display = "inline-block";
}

function playNextSong() {
    infoSpan.style.display = "none";

    trackIndex++;
    if (trackIndex < songs.length) {
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
    }
}

function playPreviousSong() {
    infoSpan.style.display = "none";

    trackIndex--;
    if (trackIndex >= 0) {
        playSong(songs[trackIndex].spotifyTrack);
        updatePlayButtons();
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
}

function updatePlayButtons() {
    if (trackIndex >= songs.length - 1) {
        playNextSongButton.disabled = true;
    } else {
        playNextSongButton.disabled = false;
    }

    if (trackIndex < 1) {
        playPreviousSongButton.disabled = true;
    } else {
        playPreviousSongButton.disabled = false;
    }
}

function log(code) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/Home/Log", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ Code: code }));
}
