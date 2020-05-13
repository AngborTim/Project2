import os
import requests

from flask import g, Flask, jsonify, flash, session, redirect, render_template, request, session
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

@app.route("/")
def index():
    return render_template("index.html")


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