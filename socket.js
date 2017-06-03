

module.exports = function(server,app) {
    var
        io = require("socket.io")(server),
        session = require("express-session")({
            secret: "asdfasdfasdfadsfasdfadsfadgfghfjsdfhgfghfdt",
            resave: true,
            saveUninitialized: true
        }),

        sharedsession = require("express-socket.io-session"),
        lodash = require('lodash');;


// Attach session
    app.use(session);

// Share session with io sockets
    var listRoom = [];
    var chatList = [[]];
    io.use(sharedsession(session));

    io.on("connection", function (socket) {
        io.emit("listRoom",listRoom);
        socket.on("chat-client-to-server",function(data){
            console.log(socket.rooms);
            console.log(data);
            if(!(chatList[data.roomId]))  chatList[data.roomId] = [];
            chatList[data.roomId].push(data);
            var sendData= chatList[data.roomId];
            io.to(data.roomId).emit("chat-server-to-client", sendData);
            console.log(sendData);

        });
        socket.on("createRoom",function(data){
            var roomid = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 18);
            listRoom.push({
                "id":roomid,
                "name":data,
                "len":0
            });
            io.emit("listRoom",listRoom);
        });
        socket.on("loginRoom",function (roomId) {
            socket.roomId = roomId;
            var room = lodash.filter(listRoom,x => x.id === roomId);
            console.log(room);
            if(room.length>0){
                room = room[0];
                room.len = room.len  + 1;
                console.log(room);
                socket.join(roomId);
                io.emit("listRoom",listRoom);
                var sendData= chatList[roomId];
                io.to(roomId).emit("chat-server-to-client", sendData);
            }
        });
        socket.on("logoutRoom",function (roomId) {
            socket.leave(roomId,function () {
                var room = lodash.filter(listRoom,x => x.id === roomId);
                console.log(room);
                if(room.length>0){
                    room = room[0];
                    if(room.len>0)
                        room.len --;
                    io.emit("listRoom",listRoom);
                }
                socket.broadcast.to(roomId).emit('leave', socket.id + " leave");
            });
        });
        console.log(socket.id+" connect");
        socket.on("disconnect",function(){
            if(socket.roomId){
                var room = lodash.filter(listRoom,x => x.id === socket.roomId);
                if(room.length>0){
                    room = room[0];
                    if(room.len >0)
                    room.len = room.len  - 1;
                    socket.leave(socket.roomId);
                    io.emit("listRoom",listRoom);
                }
            }

          //  console.log(socket.id+" disconnect");
        });
        console.log(socket.handshake.session);
        // Accept a login event with user's data
        socket.on("login", function (userdata) {
            socket.handshake.session.userdata = {"id":socket.id};
            socket.handshake.session.save();
          //  console.log(socket.handshake.session);
        });
        socket.on("logout", function (userdata) {
            if (socket.handshake.session.userdata) {
                delete socket.handshake.session.userdata;
                socket.handshake.session.save();
            }
        });

    });
}