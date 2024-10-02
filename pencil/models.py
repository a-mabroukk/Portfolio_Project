from pencil import db
from pencil import db, login_manager
from pencil import bcrypt
from flask_login import UserMixin
from flask_security import RoleMixin
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
    commentators = db.relationship("Comment", backref="owned_commentator", lazy=True)
    replies = db.relationship("ReplyComment", backref="owned_responder", lazy=True)
    archives = db.relationship("Post", secondary="saved_blogs", backref="user")
    profile = db.relationship("Profile", back_populates="users", uselist=False)
    store = db.relationship("Store", back_populates="owner", uselist=False)
    roles = db.relationship('Role', secondary='user_role', backref="user")
    buyer = db.relationship("Sales", backref="book_buyers", lazy=True)

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

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    name = db.Column(db.String(length=50), nullable=False)
    users = db.relationship("User", secondary="user_role", backref="role")

    def __repr__(self):
        return f"Role {self.id}"

# user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
# security = Security(app, user_datastore)

class UserRole(db.Model):
    __tablename__ = "user_role"
    id  = db.Column(db.Integer(), primary_key=True, nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey("user.id"))
    role_id = db.Column(db.Integer(), db.ForeignKey("role.id"))

class Profile(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    profile_picture = db.Column(db.String(), nullable=True)
    name = db.Column(db.String(length=50), nullable=False)
    username = db.Column(db.String(length=50), nullable=False)
    bio =  db.Column(db.Text(), nullable=False)
    gmail_links = db.Column(db.String(), nullable=False)
    facebook_links = db.Column(db.String(), nullable=True)
    instagram_links =  db.Column(db.String(), nullable=True)
    x_links = db.Column(db.String(), nullable=True)
    linkedin_links = db.Column(db.String(), nullable=True)
    github_links = db.Column(db.String(), nullable=True)
    users_profile = db.Column(db.Integer(), db.ForeignKey("user.id"))
    owned_posts = db.relationship("Post", backref="blogs", lazy=True)
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
    profile_owner = db.Column(db.Integer(), db.ForeignKey("profile.id"))
    saved_posts = db.relationship("User", secondary="saved_blogs", backref="post")
    post_comments = db.relationship("Comment", backref="owned_comments", lazy=True)
        
    def __repr__(self):
        return f"Post {self.id}"

class Book(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    picture = db.Column(db.String(), nullable=True)
    name = db.Column(db.String(length=50), nullable=False)
    author = db.Column(db.String(length=50), nullable=False)
    shopping = db.relationship("Store", secondary="market", backref="book")
    category = db.relationship("Category", back_populates="book_category", uselist=False)
    def __repr__(self):
        return f'Book {self.id}'

class Category(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    category_name = db.Column(db.String(length=50), nullable=False)
    book_categories = db.Column(db.Integer(), db.ForeignKey("book.id"))
    book_category = db.relationship("Book", back_populates="category")
    def __repr__(self):
        return f'Category {self.id}'

class Store(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    picture = db.Column(db.String(), nullable=True)
    name = db.Column(db.String(length=50), nullable=False)
    owner_user = db.Column(db.Integer(), db.ForeignKey("user.id"))
    owner = db.relationship("User", back_populates="store")
    shop = db.relationship("Book", secondary="market", backref="store")
    def __repr__(self):
        return f'Store {self.id}'

class Sales(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    store_sales = db.relationship("Market", backref="owned_sales", lazy=True)
    buyers = db.Column(db.Integer(), db.ForeignKey("user.id"))
    date_of_sale = db.Column(db.DateTime, default=datetime.utcnow())
    quantity_sold = db.Column(db.Integer(), nullable=False)
    def __repr__(self):
        return f"Sales {self.id}"

class Market(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    quantity = db.Column(db.Integer(), nullable=False)
    price = db.Column(db.Integer(), nullable=False)
    store_id = db.Column(db.Integer(), db.ForeignKey("store.id"))
    book_id = db.Column(db.Integer(), db.ForeignKey("book.id"))
    order = db.Column(db.Integer(), db.ForeignKey("sales.id"))


class Comment(db.Model):
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    text = db.Column(db.Text(), nullable=False)
    publication_date = db.Column(db.DateTime, default=datetime.utcnow())
    modification_date = db.Column(db.DateTime, default=datetime.utcnow())
    comment_owner = db.Column(db.Integer(), db.ForeignKey("user.id"))
    comments_on_post = db.Column(db.Integer(), db.ForeignKey("post.id"))
    reply_comments =  db.relationship("ReplyComment", backref="owned_replies", lazy=True)
    def __repr__(self):
        return f"Comment {self.id}"

class ReplyComment(db.Model):
    __tablename__ = "replycomment"
    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    text = db.Column(db.Text(), nullable=False)
    publication_date = db.Column(db.DateTime, default=datetime.utcnow())
    modification_date = db.Column(db.DateTime, default=datetime.utcnow())
    responder = db.Column(db.Integer(), db.ForeignKey("user.id"))
    reply_comment = db.Column(db.Integer(), db.ForeignKey("comment.id"))
    reply_to_reply = db.Column(db.Integer(), db.ForeignKey("replycomment.id"))
    
    child_replies = db.relationship("ReplyComment", backref=db.backref("parent_reply", remote_side=[id]), lazy=True)