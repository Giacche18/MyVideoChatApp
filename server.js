//Create our express and socket.io servers
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

// Setup peerJS server combined with express
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);    

app.set('view engine', 'ejs');      // Tell Express we are using EJS
app.use(express.static('public'));   // Tell express to pull the client script from the public folder

// If they join the base link, generate a random UUID and send them to a new room with said UUID
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})

// If they join a specific room, then render that room
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
})

// When someone connects to the server
io.on('connection', socket => {
    // When someone attempts to join the room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)                                         // Join the room
        socket.broadcast.to(roomId).emit('user-connected', userId); // Tell everyone else in the room that we joined

        // messages
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        }); 
    

        // Communicate the disconnection
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.PORT|| 3030) // Run the server on the 3030 port