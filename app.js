var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = ["Główny"];
app.use(express.static("public"));
app.use(express.static("bower_components"));

io.sockets.on("connection", function(socket){
    io.sockets.in(socket.room).emit('rec msg',"Witaj na czacie! Jesteś na kanale ogólnym!");

    socket.on('change room', function(room){
        socket.leave(socket.room);
        socket.room = room;
        socket.join(room);
        console.log("przełączyłem na pokój o nazwie:  " + socket.room );
    });

    socket.on('start', function(){
        socket.room = 'room1';
        socket.join('room1');
        console.log("Rozpoczynam nadawanie na kanale: " + socket.room);
    });

    socket.on('send msg', function(data){
        history.unshift(data);
        io.sockets.in(socket.room).emit('rec msg', data + " | pokój: "+ socket.room + " |");
    });

    socket.on("add new room", function(newRoom){
        rooms.push(newRoom);
        socket.emit("show rooms", rooms);
        socket.broadcast.emit("show rooms", rooms);
    });
    socket.emit("show rooms", rooms);
    socket.emit('history', history);
});

httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
