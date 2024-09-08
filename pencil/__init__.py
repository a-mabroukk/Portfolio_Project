from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
import os  # Import the os module here
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pencil.db"
app.config['SECRET_KEY'] = '55c4fe454d8ee50f9f81054f'
app.config["UPLOAD_FOLDER"] = 'static/uploads/'  # Path where images will be stored
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Maximum file size (16MB)
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login_page"
login_manager.login_message_category = "info"
from pencil import routes
