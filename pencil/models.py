from pencil import db
from pencil import db, login_manager
from pencil import bcrypt
from flask_login import UserMixin
from datetime import datetime


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


saved_blogs = db.Table("saved_blogs", db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
                       db.Column("post_id", db.Integer, db.ForeignKey("post.id")))

class User(db.Model, UserMixin):
    id  = db.Column(db.Integer(), primary_key=True, nullable=False)
    username = db.Column(db.String(length=30), nullable=False, unique=True)
    email = db.Column(db.String(length=50), nullable=False, unique=True)
    password_hash = db.Column(db.String(length=100), nullable=False)
    posts = db.relationship("Post", backref="owned_user", lazy=True)
    comments = db.relationship("Comment", backref="owned_commentator", lazy=True)
    replies = db.relationship("ReplyComment", backref="owned_responder", lazy=True)
    archives = db.relationship("Post", secondary="saved_blogs", backref="user")
    profile = db.relationship("Profile", back_populates="users", uselist=False)

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

class Profile(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    name = db.Column(db.String(length=50), nullable=False)
    username = db.Column(db.String(length=50), nullable=False)
    bio =  db.Column(db.Text(), nullable=False)
    profile_picture = db.Column(db.String(), nullable=True)
    gmail_links = db.Column(db.String(), nullable=False)
    facebook_links = db.Column(db.String(), nullable=True)
    instagram_links =  db.Column(db.String(), nullable=True)
    x_links = db.Column(db.String(), nullable=True)
    linkedin_links = db.Column(db.String(), nullable=True)
    github_links = db.Column(db.String(), nullable=True)
    users_profile = db.Column(db.Integer(), db.ForeignKey("user.id"))
    users = db.relationship("User", back_populates="profile")

    def __repr__(self):
        return f"Profile {self.id}"

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
    reply_comments =  db.relationship("ReplyComment", backref="owned_replies", lazy=True)

    def __repr__(self):
        return f"Comment {self.id}"

class ReplyComment(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    text = db.Column(db.Text(), nullable=False)
    publication_date = db.Column(db.DateTime, default=datetime.utcnow())
    modification_date = db.Column(db.DateTime, default=datetime.utcnow())
    responder = db.Column(db.Integer(), db.ForeignKey("user.id"))
    reply_comment = db.Column(db.Integer(), db.ForeignKey("comment.id"))
