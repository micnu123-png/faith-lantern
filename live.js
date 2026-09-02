const video = document.getElementById("liveVideo");
const offlineMessage = document.getElementById("offlineMessage");

const liveStatus = document.getElementById("liveStatus");
const statusText = document.getElementById("statusText");

const STREAM_URL =
    "http://localhost:8888/live/catholic/index.m3u8";


function setOffline() {

    offlineMessage.classList.remove("hidden");

    liveStatus.classList.remove("online");
    liveStatus.classList.add("offline");

    statusText.textContent = "OFFLINE";
}


function setLive() {

    offlineMessage.classList.add("hidden");

    liveStatus.classList.remove("offline");
    liveStatus.classList.add("online");

    statusText.textContent = "LIVE";
}


function startStream() {

    if (typeof Hls !== "undefined" && Hls.isSupported()) {

        const hls = new Hls();

        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);


        hls.on(Hls.Events.MANIFEST_PARSED, function () {

            console.log("LIVE STREAM FOUND");

            video.play()
                .then(() => {
                    setLive();
                })
                .catch(() => {
                    console.log("Waiting for user interaction...");
                });

        });


        hls.on(Hls.Events.ERROR, function (event, data) {

            console.log("HLS error:", data);

            if (data.fatal) {

                setOffline();

                setTimeout(() => {

                    hls.destroy();

                    startStream();

                }, 5000);

            }

        });

    }

    else if (video.canPlayType("application/vnd.apple.mpegurl")) {

        video.src = STREAM_URL;


        video.addEventListener("loadedmetadata", function () {

            video.play()
                .then(() => {
                    setLive();
                })
                .catch(() => {
                    console.log("Waiting for user interaction...");
                });

        });

    }

    else {

        console.log("HLS is not supported.");

        setOffline();

    }
}


video.addEventListener("playing", function () {

    setLive();

    console.log("🔴 LIVE");

});


video.addEventListener("waiting", function () {

    console.log("Buffering...");

});


video.addEventListener("error", function () {

    setOffline();

    console.log("Stream offline.");

});


setOffline();

startStream();