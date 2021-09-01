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
        text.val('');
        }
    });

    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    })
})

// If a user disconnect
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close(); // close the call with the user if he disconnect
})

// When we first open the app, have us join a room
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// This runs when someone joins our room
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream) // Call the user who just joined
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })

    // If they leave, remove their video
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => { // Play the video as it loads
      video.play()
    })

    videoGrid.append(video) // Append video element to videoGrid
}

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

// Find the .main__mute_button element
const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Find the .main__mute_button element and setting up it to unmute after click
const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Find the .main__video_button element
const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

// Find the .main__video_button element and setting up it to play video after click
const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
} 