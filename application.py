import os
import requests
import json

from datetime import datetime
from flask import g, Flask, jsonify, redirect, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

class User:
  def __init__(self, name, email):
    self.name = name
    self.email = email

users_list = []
users_list.append(User("Andrew", "survila@mail.ru"))

class Channel:
  def __init__(self, name, messages, owner, id):
    self.name = name
    self.messages = messages
    self.owner = owner
    self.id = id

channels_list = []
messages_list = []

request_counter = 0

@app.route("/")
def index():
    global request_counter
    if request_counter == 0:
        request_counter = 1
        # если сервер только что перезапущен
        return render_template("index.html", channels_list = channels_list, reset_status = 'true')
    else:
        return render_template("index.html", channels_list = channels_list, reset_status = 'false')
    


@app.route("/check", methods=["GET"])
def check():
    for user in users_list:
        if user.email == request.args.get('email'):
            return jsonify({ "success": False, "username": user.name, "email": user.email, "user_id": users_list.index(user) })
    return jsonify({ "success": True } ) 


@app.route("/change_name", methods=["GET"])
def change_name():
    for user in users_list:
        if user.email == request.args.get('email'):
            user.name = request.args.get('new_user_name')
            return jsonify({ "success": True, "username": user.name, "email": user.email, "user_id": users_list.index(user) })

    return jsonify({ "success": False } )

@app.route("/add_new_user", methods=["GET"])
def add_new_user():
    newuser = User(request.args.get('new_user_name'), request.args.get('email'))
    users_list.append(newuser)
    return jsonify({ "username": newuser.name, "email": newuser.email, "user_id": users_list.index(newuser)})


@app.route("/get_messages", methods=["GET"])
def get_messages():
    if request.args.get('channel_id') is None:
        return jsonify({ "success": False })
    else:
        mesgs = []
        for message in messages_list:
            if message["channel_id"] == int(request.args.get('channel_id')):
                mesgs.append(message)
        if len(mesgs) != 0:
            return jsonify(mesgs)
        else:
        	return jsonify({ "success": False })



@socketio.on("add_channel")
def add_channel(data):
    channel_name = data["channel_name"]
    channel_owner = data["channel_owner"]
    total_messages = 0
    if len(channels_list) == 0:
        channel_id = len(channels_list)+1
        channels_list.append(Channel(channel_name, total_messages, channel_owner, channel_id))
        emit("new_channel", {"success": True, 'channel_id': channel_id, 'channel_name': channel_name, 'channel_owner': channel_owner, 'total_messages': total_messages}, broadcast=True)
    else:
        for channel in channels_list:
            duplicate = False
            if channel.name == channel_name:
                duplicate = True
                break
        if not duplicate:
            channel_id = len(channels_list)+1
            channels_list.append(Channel(channel_name, total_messages, channel_owner, channel_id))
            emit("new_channel", {"success": True, 'channel_id': channel_id, 'channel_name': channel_name, 'channel_owner': channel_owner, 'total_messages': total_messages}, broadcast=True)
        else:
            emit("new_channel", {"success": False,'channel_name': channel_name}, broadcast=False)      


@socketio.on("add_message")
def add_message(data):
    if data["message_text"] !="":
        redrow = False
        # здесь определяем сколько максимально сообщений может храниться
        # нужно получить количество сообщений именно из этого канала
        mesgs = []
        for m in messages_list:
            if m["channel_id"] == int(data["channel_id"]):
                mesgs.append(m)
        # если сообщений в канале больше чем 5
        if len(mesgs) == 5:
            # удаляем из общего списка первое сообщение из этого канала
            messages_list.remove(mesgs[0])
            redrow = True
        if len(messages_list) == 0:
            msg_id = 0
        else:
            msg_id = messages_list[-1]["id"] + 1
        new_message = {'id' : msg_id, 'owner_id': data["user_id"], 'owner_name': data["user_name"], 'channel_id': int(data["channel_id"]), 'timestamp': str(datetime.now().strftime("%H:%M %D")), 'text': data["message_text"]}
        messages_list.append(new_message)
        for channel in channels_list:
            if channel.id == int(data["channel_id"]):
                if redrow == False:
                    channel.messages += 1
                chnlmsg = channel.messages
                break
        print(f'chnlmsg {chnlmsg} redraw = {redrow}')
        emit("new_message", {'messages_counter': chnlmsg, 'redrow': redrow, 'id' : len(messages_list), 'owner_id': data["user_id"], 'owner_name': data["user_name"], 'channel_id': data["channel_id"], 'timestamp': str(datetime.now().strftime("%H:%M %D")), 'text': data["message_text"]}, broadcast=True)
    else:
    	emit("new_message", {"success": False}, broadcast=False)