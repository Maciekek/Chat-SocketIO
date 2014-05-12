var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = ["Główny"];
app.use(express.static("public"));
app.use(express.static("bower_components"));

app.get('/', function(req,res){
    res.sendfile("public/index.html");
});

app.get('/chat', function(req,res){
    res.sendfile("public/chat.html");
});


io.sockets.on("connection", function(socket){
    var roomName = "Główny";
    console.log(roomName);
    history[roomName] = [];
    socket.room = 'Główny';
    socket.join("Główny");
    socket.emit('rec msg',"Witaj na czacie! Jesteś na kanale ogólnym!");

    socket.on('change room', function(room){
        socket.leave(socket.room);
        socket.room = room;
        socket.join(room);
        roomName = socket.room;
        socket.emit('history', history[room]);
        console.log("przełączyłem na pokój o nazwie:  " + socket.room );
        console.log(history);
        socket.emit('rec msg', "Jesteś na kanale " + room);
    });

    socket.on('start', function(){
        socket.room = 'Główny';
        socket.join('Główny');
        console.log("Rozpoczynam nadawanie na kanale: " + socket.room);
    });

    socket.on('send msg', function(data){
        roomName = socket.room;
        history[roomName].unshift(data);
        io.sockets.in(socket.room).emit('rec msg', data);
    });

    socket.on("add new room", function(newRoom){
        history[newRoom] = [];
        socket.room = newRoom;
        rooms.push(newRoom);
        socket.emit("show rooms", rooms);
        socket.broadcast.emit("show rooms", rooms);
    });
    socket.emit("show rooms", rooms);


});

httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
