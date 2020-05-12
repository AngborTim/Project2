import os
import requests

from flask import g, Flask, jsonify, flash, session, redirect, render_template, request, session
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from functools import wraps
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/check", methods=["GET"])
def check():
    name_test = db.execute("SELECT email, username FROM users WHERE email = :test_email",
                           {"test_email":request.args.get('email')}).fetchone()
    if name_test:
        return jsonify({ "success": False, "username": name_test['username'], "email": name_test['email'] })
    else:
        return jsonify({ "success": True } )

@app.route("/change_name", methods=["GET"])
def change_name():
    if db.execute("UPDATE users SET username = :new_name WHERE email = :email",
                           {"new_name":request.args.get('new_user_name'),
                            "email"   :request.args.get('email')}):
	    db.commit()
	    return jsonify({ "success": True, "username": request.args.get('new_user_name'), "email": request.args.get('email')})
    else:
        return jsonify({ "success": False } )
