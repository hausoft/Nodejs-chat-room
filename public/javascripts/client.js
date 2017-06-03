/**
 * Created by nguyenvanhau on 5/31/17.
 */

var socket = io();
var roomId ="";
socket.on("chat-server-to-client",function(data){
    $("#chat_client_user").html("");
    $.each(data, function( index, value ) {
        if(socket.id === value.userId ){
        $("#chat_client_user").append("<li class='right clearfix'><span class='chat-img pull-left'><img  width='40px' height='40px' src='/images/hot-girl.jpg' alt='User Avatar' class='img-circle' /></span><div class='chat-body clearfix'><div class='header'> <strong class='primary-font'>"+
            value.userId+"</strong> <small class='pull-right text-muted'><span class='glyphicon glyphicon-time'></span>12 mins ago</small></div><p>"
                + value.message+"</p></div></li>");
        }else {
            $("#chat_client_user").append("<li class='right clearfix'><span class='chat-img pull-right'><img src='/images/hot-girl.jpg'  width='40px' height='40px' alt='User Avatar' class='img-circle' /></span>"
                + "<div class='chat-body clearfix'>"
                + "<div class='header'>"
                + "<small class=' text-muted'><span class='glyphicon glyphicon-time'></span>15 mins ago</small>"
                + "<strong class='pull-right primary-font'>" + value.userId + "</strong>"
                + "</div><p>"
                + value.message + "</p></div></li>");
        }
    });
});
socket.on("listRoom",function (data) {
    $("#listRoom").html("");
    console.log(data);
    $.each(data, function( index, value ) {
        $("#listRoom").append("<li class='list-group-item' onclick='showChat(\""+value.id+"\")' id='"+value.id+"'>"+value.name+" <span class='badge'>"+value.len+"</span></li>");
    });
});
socket.on("leave",function (data) {
    $("#chat_user").append("<li>"+data+"</li>")
});
function showChat(id) {
    roomId = id;
    console.log(roomId);
    $("#chat").show();
    $("#room").hide();
    $("#nameRoom").html(roomId);
    socket.emit("loginRoom",roomId);
}
function hideChat() {
    $("#chat").hide();
    $("#room").show();
    socket.emit("logoutRoom",roomId);
    roomId = "";
}
$(function () {
    $("#chat").hide();
    $("#listRoom").html("");
    $("#createRoom").click(function(){
        var Room = prompt("name room", "Room");
        if(Room){
            socket.emit("createRoom",Room);
        }
    });
    $("#btn-input").keypress(function(e) {
        if(e.which == 13) {
            $("#btn-chat").click();
        }
    });
    $("#btn-chat").click(function(){
        var message = $("#btn-input").val();
        socket.emit("chat-client-to-server",{"roomId":roomId,"message":message,"userId":socket.id});
        $("#btn-input").val("");
    });
});