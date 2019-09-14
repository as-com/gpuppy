import os
from flask import Flask
from flask import escape
from flask import request
from flask import jsonify
from flask import request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import sqlite3
import sqlalchemy

UPLOAD_FOLDER = './uploads'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'

db = SQLAlchemy(app)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String)
    status = db.Column(db.Integer)  # 0 = not started, 1 = started, 2 = done

    def __repr__(self):
        return f"Job(id={self.id}, filename={self.filename}, status={self.status})"

@app.route('/')
def hello():
    name = request.args.get("name", "World")
    return f'Hello, {escape(name)}!'

@app.route('/api/jobs', methods = ['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'status': 'Failed -- upload a file'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'Failed -- filename empty'}), 400

    filename_base = str(uuid.uuid64().hex)
    filename = '{}.tar.gz'.format(filename_base)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    job = Job(filename = filename_base, status = 0)
    db.session.add(job)
    db.session.commit()
    return jsonify({"status": "Success"})
