import os
import pickle
import hashlib
import sqlite3
from flask import Flask, request, render_template_string

app = Flask(__name__)
SECRET_KEY = "hardcoded_secret_key_123"

@app.route("/search")
def search():
    query = request.args.get("q", "")
    # XSS vulnerability - rendering user input directly
    return render_template_string(f"<h1>Results for: {query}</h1>")

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]

    # SQL Injection
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username='{username}' AND password='{password}'")
    user = cursor.fetchone()

    if user:
        return "Login successful"
    return "Invalid credentials"

@app.route("/upload", methods=["POST"])
def upload():
    data = request.get_data()
    # Insecure deserialization
    obj = pickle.loads(data)
    return str(obj)

def hash_password(password):
    # Weak hashing algorithm
    return hashlib.md5(password.encode()).hexdigest()

def run_command(cmd):
    # Command injection
    os.system(cmd)

if __name__ == "__main__":
    app.run(debug=True)
