from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, FileField
from wtforms.validators import Length, EqualTo, Email, DataRequired, ValidationError
from pencil.models import User, Post, Comment, ReplyComment, Profile
import os
from werkzeug.utils import secure_filename


class RegisterForm(FlaskForm):

    def validate_username(self, username_to_check):
        user = User.query.filter_by(username=username_to_check.data).first()
        if user:
            raise ValidationError("username already exists! Please try a different one")

    def validate_email_address(self, email_address_to_check):
        email_address = User.query.filter_by(email=email_address_to_check.data).first()
        if email_address:
            raise ValidationError("email address already exists! Please try a different one")

    username = StringField(label="Userame", validators=[Length(min=2, max=30), DataRequired()])
    email_address = StringField(label="Email Address", validators=[Email(), DataRequired()])
    password1 = PasswordField(label="Password", validators=[Length(min=8), DataRequired()])
    password2 = PasswordField(label="Confirm Password", validators=[EqualTo("password1"), DataRequired()])
    submit = SubmitField(label="Create an Account")

class LoginForm(FlaskForm):
    username = StringField(label="Userame", validators=[DataRequired()])
    password = PasswordField(label="Password", validators=[DataRequired()])
    submit = SubmitField(label="LogIn")

class PostForm(FlaskForm):
    title = StringField(label="Title:", validators=[Length(max=100), DataRequired()])
    content = TextAreaField(label="Create a post", validators=[DataRequired()])
    submit = SubmitField(label="Save")

class SearchForm(FlaskForm):
    input_search = StringField(label="Search", validators=[Length(max=100), DataRequired()])

class CommentForm(FlaskForm):
    comment = TextAreaField(label="Write your comment....", validators=[DataRequired()])
    submit = SubmitField(label="Post")

class ReplyForm(FlaskForm):
    reply = TextAreaField(label="reply comment", validators=[DataRequired()])
    submit = SubmitField(label="Send")

class ReplyReplyForm(FlaskForm):
    reply_reply = TextAreaField(label="Write your reply", validators=[DataRequired()])
    submit = SubmitField(label="Send")

class ProfileForm(FlaskForm):
    picture = FileField(label="Profile Picture", validators=[DataRequired()])
    name = StringField(label="Name", validators=[Length(min=2, max=30), DataRequired()])
    username = StringField(label="Username", validators=[Length(min=2, max=30), DataRequired()])
    bio =  StringField(label="Bio", validators=[Length(min=2, max=100), DataRequired()])
    gmail = StringField(label="Gmail", validators=[DataRequired()])
    facebook = StringField(label="Facebook", validators=[DataRequired()])
    instagram = StringField(label="Instagram", validators=[DataRequired()])
    x = StringField(label="X", validators=[DataRequired()])
    linkedin = StringField(label="LinkedIn", validators=[DataRequired()])
    github = StringField(label="GitHub", validators=[DataRequired()])
    submit = SubmitField(label="Save")
