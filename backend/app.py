import os
from flask import Flask
from flask import escape
from flask import request
from flask import jsonify
from flask import request
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSION = set(['tar', 'gz'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

    # TODO generate a real filename
    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"status": "Success"})
