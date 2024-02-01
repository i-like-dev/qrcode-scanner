// script.js
const btn = document.getElementById('scan-btn');
const canvasElement = document.getElementById('qr-canvas');
const canvas = canvasElement.getContext('2d');

let videoStream;

btn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
        videoStream = stream;
        scanQRCode();
    }).catch(function(error) {
        console.error("無法訪問攝像頭", error);
    });
});

function scanQRCode() {
    let video = document.createElement('video');
    video.srcObject = videoStream;
    video.play();

    video.onloadedmetadata = function() {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        scan();
    };

    function scan() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                videoStream.getTracks().forEach(function(track) {
                    track.stop();
                });

                if (/^https?:\/\/go\.walking-cat\.com\/.+$/.test(code.data)) {
                    window.location.href = code.data;
                } else {
                    alert("掃描的 QR 碼不是有效的 go.walking-cat.com 網址");
                }
            } else {
                requestAnimationFrame(scan);
            }
        } else {
            requestAnimationFrame(scan);
        }
    }
}
