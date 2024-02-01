// script.js
const btn = document.getElementById('scan-btn');
const video = document.getElementById('qr-video');
const canvasElement = document.createElement('canvas');
const canvas = canvasElement.getContext('2d');

let videoStream;

btn.addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                videoStream = stream;
                video.srcObject = stream;
                video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                video.style.display = "block";
                video.play();
                scanQRCode();
            }).catch(function(error) {
                console.error("無法訪問攝像頭", error);
            });
    } else {
        alert("您的瀏覽器不支持攝像頭訪問");
    }
});

function scanQRCode() {
    function scan() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                videoStream.getTracks().forEach(function(track) {
                    track.stop();
                });

                video.style.display = "none";

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
    requestAnimationFrame(scan);
}
