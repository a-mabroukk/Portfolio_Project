from pencil import db
from pencil import db, login_manager
from pencil import bcrypt
from flask_login import UserMixin
from datetime import datetime


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id  = db.Column(db.Integer(), primary_key=True, nullable=False)
    username = db.Column(db.String(length=30), nullable=False, unique=True)
    email = db.Column(db.String(length=50), nullable=False, unique=True)
    password_hash = db.Column(db.String(length=100), nullable=False)
    posts = db.relationship("Post", backref="owned_user", lazy=True)
    comments = db.relationship("Comment", backref="owned_commentator", lazy=True)

    @property
    def password(self):
        return self.password

    @password.setter
    def password(self, plain_text_password):
        self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode('utf-8')

    def check_password_correction(self, attempted_password):
        return bcrypt.check_password_hash(self.password_hash, attempted_password)
    #@password.setter
    #def password(self, plain_text_password):
        #self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode("utf-8")

    #def check_password_correction(self, attempted_password):
        #return bcrypt.check_password_hash(self.password_hash, attempted_password)


class Post(db.Model):
    id  = db.Column(db.Integer(), primary_key=True, nullable=False)
    title = db.Column(db.String(length=50), nullable=False)
    content = db.Column(db.Text(), nullable=False)
    publication_date = db.Column(db.DateTime, default=datetime.utcnow())
    modification_date = db.Column(db.DateTime, default=datetime.utcnow())
    owner = db.Column(db.Integer(), db.ForeignKey("user.id"))
    commentators = db.relationship("Comment", backref="owned_commentators", lazy=True)
        
    def __repr__(self):
        return f"Post {self.id}"

class Comment(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    text = db.Column(db.Text(), nullable=False)
    publication_date = db.Column(db.DateTime, default=datetime.utcnow())
    modification_date = db.Column(db.DateTime, default=datetime.utcnow())
    commentator = db.Column(db.Integer(), db.ForeignKey("user.id"))
    commentatorr = db.Column(db.Integer(), db.ForeignKey("post.id"))

    def __repr__(self):
        return f"Comment {self.id}"