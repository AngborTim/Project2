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
channels_list.append(Channel("Test",0,0,1))


messages_list = []
message = {"id" : 1, "owner_id": 0, "owner_name": "Andrew", "channel_id": 1, "timestamp": "01.01.2020 12:00", "text": "Test test test test"}
messages_list.append(message)

@app.route("/")
def index():
    return render_template("index.html", channels_list = channels_list, messages_list = messages_list)


@app.route("/check", methods=["GET"])
def check():
    for user in users_list:
        if user.email == request.args.get('email'):
            return jsonify({ "success": False, "username": user.name, "email": user.email, "user_id": users_list.index(user) + 1 })
    return jsonify({ "success": True } ) 


@app.route("/change_name", methods=["GET"])
def change_name():
    for user in users_list:
        if user.email == request.args.get('email'):
            user.name = request.args.get('new_user_name')
            return jsonify({ "success": True, "username": user.name, "email": user.email, "user_id": users_list.index(user) })

    return jsonify({ "success": False } )

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
        new_message = {'id' : len(messages_list) + 1, 'owner_id': data["user_id"], 'owner_name': data["user_name"], 'channel_id': int(data["channel_id"]), 'timestamp': str(datetime.now().strftime("%H:%M %D")), 'text': data["message_text"]}
        messages_list.append(new_message)
        for channel in channels_list:
            if channel.id == int(data["channel_id"]):
                channel.messages += channel.messages
                chnlmsg = channel.messages
                break
        emit("new_message", {'messages_counter': chnlmsg, 'id' : len(messages_list), 'owner_id': data["user_id"], 'owner_name': data["user_name"], 'channel_id': data["channel_id"], 'timestamp': str(datetime.now().strftime("%H:%M %D")), 'text': data["message_text"]}, broadcast=True)
    else:
    	emit("new_message", {"success": False}, broadcast=False)