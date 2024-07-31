from pencil import app
from flask import render_template, redirect, url_for, flash, request, abort
from pencil.models import Post, User
from pencil.forms import RegisterForm, LoginForm, PostForm
from pencil import db
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime


@app.route("/")
@app.route("/home", methods=["GET", "POST"])
@login_required
def home_page():
    posts = Post.query.order_by(Post.title.desc()).limit(10)
    return render_template("home.html", posts=posts)

@app.route("/publish", methods=["POST", "GET"])
@login_required
def posting_page():
    post_form = PostForm()
    # Publishing a post
    if post_form.validate_on_submit(): # Ensure the form is valid
        try:
            post_to_create = Post(title=post_form.title.data,
                                  content=post_form.content.data,
                                  owner=current_user.id)
            db.session.add(post_to_create)
            db.session.commit()
            post_id = post_to_create.id
            flash(f"The blog has been saved successfully", category="success")
            return redirect(url_for("blog_page", post_id=post_id))
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            print(f"Database Error: {e}")
            flash("An error occurred while saving the post. Please try again.", category="danger")
    return render_template("add_post.html", post_form=post_form)

@app.route("/blog", methods=["GET", "POST"])
def blog_page():
    if request.method == "GET":
    # Display specific blog
        post_id = request.args.get("post_id")
        if post_id:
            requested_blog = Post.query.filter_by(id=post_id).first()
            if requested_blog is None:
                abort(404)
            return render_template("blog.html", post_id=requested_blog)
            #return render_template("blog.html", post_id=requested_blog)
    return redirect(url_for("home_page"))

@app.route("/modify", methods=["POST", "GET"])
@login_required
def modify_post():
    if request.method == "POST":
        # Update specific blog if it exists
        post_id = request.form.get("post_id")
        requested_blog = Post.query.filter_by(id=post_id).first()
        if requested_blog:
            new_title = request.form.get("title")
            new_content = request.form.get("content")
            modification_date = datetime.now()
            requested_blog.title = new_title
            requested_blog.content = new_content
            requested_blog.modification_date = modification_date
            db.session.commit()
            flash(f"The blog has been updated successfully.", category='success')
            return redirect(url_for("blog_page", post_id=post_id))
        else:
            abort(404)
    return redirect(url_for("home_page"))

@app.route("/delete", methods=["POST", "GET"])
@login_required
def delete_page():
    if request.method == "POST":
    # Canceling blog
        post_id = request.form.get("post_id")
        if post_id:
            post_to_delete = Post.query.filter_by(id=post_id).first()
            if post_to_delete:
                db.session.delete(post_to_delete)
                db.session.commit()
                flash(f"The blog has been removed successfully", category="success")
            else:
                flash(f"The blog not found", category="danger")
    return redirect(url_for("home_page"))
                

@app.route("/register", methods=["GET", "POST"])
def register_page():
    form = RegisterForm()

    if form.validate_on_submit():
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

    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(attempted_password=form.password.data):
            login_user(attempted_user)
            flash(f"Success! You are logged in as: {attempted_user.username}", category="success")
            return redirect(url_for("home_page"))
        else:
            flash('Username or password are not correct! Please try again', category='danger')
    return render_template("login.html", form=form)

@app.route("/logout")
def logout_page():
    logout_user()
    flash("You have been logged out!", category='info')
    return redirect(url_for("home_page"))
