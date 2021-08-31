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