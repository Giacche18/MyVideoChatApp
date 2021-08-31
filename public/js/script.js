const socket = io('/'); // Create our socket

const videoGrid = document.getElementById('video-grid'); // Find the Video-Grid element

// Creating a peer element which represents the current user
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

const myVideo = document.createElement('video'); // Create a new video tag to show our video
myVideo.muted = true; // Mute ourselves on our end so there is no feedback loop

let myVideoStream;
const peers = {};

// Access the user's video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream); // Display our video to ourselves
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
      video.play()
    })

    videoGrid.append(video) // Append video element to videoGrid
}