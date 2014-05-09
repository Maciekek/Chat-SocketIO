var express = require("express");
var app = express();

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = ["room1", "room2", "room3"];
app.use(express.static("public"));
app.use(express.static("bower_components"));

io.sockets.on("connection", function(socket){

    socket.on('start', function(){
        socket.room = 'room1';
        socket.join('room1');
        console.log("Rozpoczynam nadawanie na kanale: " + socket.room);
    });
    socket.on('send msg', function(data){

//      console.log('send msg');
//      history.unshift(data);
//      io.sockets.in(socket.room).emit('rec msg', data);
//      socket.on('change room', function(newRoom){
//      console.log("zmieniam Pokoj");
//      socket.leave(socket.room);
//      socket.join(newRoom);
//      socket.room = newRoom;
//      console.log(socket.room);
//      socket.emit("send msg", "change to rooom2");
        history.unshift(data);
        io.sockets.in(socket.room).emit('rec msg', data + " | pokój: "+ socket.room + " |");
   });
   socket.emit('history', history);
});




//io.sockets.on('connection', function (socket) {
//    socket.on('send msg', function (data) {
//        history.unshift(data);
//        io.sockets.emit('rec msg', data);
//    });
//    socket.emit('history', history);
//});

//var room1 = io
//    .of('/room1')
//    .on('connection', function (socket) {
//        console.log("soccet connection on room1");
//        socket.on('send msg', function (data) {
//            history.unshift(data);
//
//            socket.emit('rec msg', data);
//            socket.broadcast.emit('rec msg', data);
//
//        });
//        socket.emit('history', history);
//        socket.emit('rooms', rooms);
//
//        socket.on("new room", function(data){
//            console.log("Tworze nowy pokój: " + data);
//            rooms.push(data);
//            console.log("Istniejace pokoje: " + rooms);
//            socket.emit('show rooms', rooms);
//            socket.broadcast.emit('show rooms', rooms);
//        });
//    });
//var room2 = io
//    .of('/room2')
//    .on('connection', function (socket) {
//        console.dir(socket);
//        socket.on('send msg', function (data) {
//            history.unshift(data);
//            console.log(data);
//            socket.emit('rec msg', data);
//            socket.broadcast.emit('rec msg', data);
//
//        });
//        socket.emit('history', history);
//        socket.emit('rooms', rooms);
//
//        socket.on("new room", function(data){
//            console.log("Tworze nowy pokój: " + data);
//            rooms.push(data);
//            console.log("Istniejace pokoje: " + rooms);
//            socket.emit('show rooms', rooms);
//            socket.broadcast.emit('show rooms', rooms);
//        });
//    });
//        var room3 = io
//            .of('/room3')
//            .on('connection', function (socket) {
//                console.log("soccet connection on room3");
//                socket.on('send msg', function (data) {
//                    history.unshift(data);
//
//                    socket.emit('rec msg', data);
//                    socket.broadcast.emit('rec msg', data);
//
//                });
//                socket.emit('history', history);
//                socket.emit('rooms', rooms);
//
//                socket.on("new room", function(data){
//                    console.log("Tworze nowy pokój: " + data);
//                    rooms.push(data);
//                    console.log("Istniejace pokoje: " + rooms);
//                    socket.emit('show rooms', rooms);
//                    socket.broadcast.emit('show rooms', rooms);
//                });
//            });




httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
