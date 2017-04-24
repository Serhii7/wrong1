var socketio =require('socket.io');
var io;
// var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server){
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection', function(socket){
		// guestNumber = assignGuestName(socket,guestNumber, nickNames, namesUsed);
		joinRoom(socket, 'Lobby');
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);
		socket.on('rooms', function(){
			socket.emit('rooms', o.sockets.manager.rooms);
		});
		handleClientDisconnection(socket, nickNames,naesUsed);
	});
};

function joinRoom(socket, room){
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room:room});
	socket.broadcast.to(room).emit('message',{
		text:nickNames[socket.id]+''
	})
}
<h1><%= posts[0].post[0].text %></h1>