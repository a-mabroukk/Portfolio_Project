from pencil import app
from flask import render_template, redirect, url_for, flash, request
from pencil.models import Post, User
from pencil.forms import RegisterForm, LoginForm, PostForm
from pencil import db
from flask_login import login_user, logout_user, login_required, current_user


@app.route("/")
@app.route("/home", methods=["GET"])
@login_required
def home_page():
    posts = Post.query.order_by(Post.title.publication_date.data.desc()).limit(10)
    return render_template("home.html", posts=posts)

@app.route("/blog", methods=["GET", "POST"])
def blog_post():
    posts_id = 1
    posts = Post.query.filter_by(id=posts_id).first()
    return render_template("blog.html", posts=posts)

@app.route("/bloging", methods=["GET", "POST"])
@login_required
def post_page():
    post_form = PostForm()

    if request.method == "POST":
        #Publishing a post
        if post_form.validate_on_submit: # Ensure the form is valid
            post_to_create = Post(title=form.title.data,
                                  content=form.content.data, owner=current_user.id)
            db.session.add(post_to_create)
            db.session.commit()
            post_page(post_to_create)
            flash(f"The blog has been saved successfully", category="success")
            return redirect(url_for("home_page"))

        #Canceling blog
        deleted_post = request.form.get("deleted_post")
        if deleted_post:
            del_post = Post.query.filter_by(title=deleted_post).first()
            if del_post:
                db.session.delete(del_post)
                db.session.commit()
                flash(f"The blog has been removed successfully", category="success")
            else:
                flash(f"The blog not found", category="danger")
        return render_template("add_post.html", post_form=post_form)

@app.route("/register", methods=["GET", "POST"])
def register_page():
    form = RegisterForm()

    print(form.password1.data)
    if form.validate_on_submit:
        user_to_create = User(username=form.username.data,
                              email=form.email_address.data,
                              password=form.password1.data)
        db.session.add(user_to_create)
        db.session.commit()
        login_user(user_to_create)
        flash(f"Account created successfully! You are now logged in as {user_to_create.username}", category='success')
        return redirect(url_for("home_page"))

    if form.errors != {}:
        for error_message in form.errors.values():
            flash(f"There is an error with registing: {error_message}", category="danger")
    return render_template("register.html", form=form)

@app.route("/login", methods=["GET", "POST"])
def login_page():
    form = LoginForm()

    if form.validate_on_submit:
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(
                attempted_password=form.password.data
        ):
            login_user(attempted_user)
            flash(f"Success! You are logged in as: {attempted_user.username}", category="success")
            return redirect(url_for("home.html"))
        else:
            flash('Username or password are not correct! Please try again', category='danger')
    return render_template("login.html", form=form)

@app.route("/logout")
def logout_page():
    logout_user()
    flash("You have been logged out!", category='info')