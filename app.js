var express = require("express");
var app = express();
var connect = require('connect');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');
var sessionStore = new connect.session.MemoryStore();

var sessionSecret = 'wielkiSekret44';
var sessionKey = 'connect.sid';
var server;
var sio;

var httpServer = require("http").createServer(app);

var socketio = require("socket.io");
var io = socketio.listen(httpServer);

var history = [];
var rooms = ["Główny"];

// Konfiguracja passport.js
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        if ((username === 'admin') && (password === 'tajne')) {
            console.log("Udane logowanie...");
            return done(null, {
                username: username,
                password: password
            });
        } else {
            console.log("Złe dane");
            return done(null, false);
        }
    }
));


app.use(express.static("public"));
app.use(express.static("bower_components"));
app.use(express.cookieParser());
app.use(express.urlencoded());
app.use(express.session({
    store: sessionStore,
    key: sessionKey,
    secret: sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

//sio = socketIo.listen(httpServer);

app.get('/', function(req,res){
    res.sendfile("public/index.html");
});

app.get('/chat', function(req,res){
    if(req.user){
        res.sendfile("public/chat.html");    
    }
    else {
        res.sendfile("public/login.html");
    }
    
});

app.get('/login', function (req, res) {
    var body = '<html><body>'
    body += '<form action="/login" method="post">';
    body += '<div><label>Użytkownik:</label>';
    body += '<input type="text" name="username"/><br/></div>';
    body += '<div><label>Hasło:</label>';
    body += '<input type="password" name="password"/></div>';
    body += '<div><input type="submit" value="Zaloguj"/></div></form>';
    body += '</body></html>'
    res.send(body);
});

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        
    }),
    function (req, res) {
        res.redirect('/chat.html');
    }
);


io.sockets.on("connection", function(socket){
    console.log('User Connected: ' + socket.handshake.user.username);

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

var onAuthorizeSuccess = function (data, accept) {
    console.log('Udane połączenie z socket.io');

    accept(null, true);
};

var onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
        console.log("Nieudane logowanie");
    }
    console.log('Nieudane połączenie z socket.io asdasd:', message);
    accept(null, false);
};

io.set('authorization', passportSocketIo.authorize({
    passport: passport,
    cookieParser: express.cookieParser,
    key: sessionKey, // nazwa ciasteczka, w którym express/connect przechowuje identyfikator sesji
    secret: sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

io.set('log level', 2); // 3 == DEBUG, 2 == INFO, 1 == WARN, 0 == ERROR

io.sockets.on('connection', function (socket) {
    socket.emit('news', {
        ahoj: 'od serwera'
    });
    socket.on('reply', function (data) {
        console.log(data);
    });
});


httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na pocie 3000');
});
