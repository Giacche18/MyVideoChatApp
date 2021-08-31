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
    
    // When we join someone's room we will receive a call from them
    myPeer.on('call', call => {
        call.answer(stream)                             // Stream them our video/audio
        const video = document.createElement('video')   // Create a video tag for them
        call.on('stream', userVideoStream => {          // When we recieve their stream
          addVideoStream(video, userVideoStream)        // Display their video to ourselves
        })
    })
    
    // If a new user connect
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

    // input value
    let text = $("input");

    // when press enter send message
    $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('')
        }
    });

    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()

    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
      video.play()
    })

    videoGrid.append(video) // Append video element to videoGrid
}