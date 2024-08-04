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
            db.session.save(post_to_create)
            post_id = post_to_create.id
            flash(f"The blog has been saved successfully", category="success")
            return redirect(url_for("blog_page", post_id=post_id))
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            flash("An error occurred while saving the post. Please try again.", category="danger")
    if post_form.errors != {}:
        for error_message in post_form.errors.values():
            flash(f"There is an error with adding: {error_message}", category="danger")
    return render_template("add_post.html", post_form=post_form)

@app.route("/blog", methods=["GET", "POST"])
def blog_page():
    if request.method == "GET":
    # Display specific blog
        post_id = request.args.get("post_id")
        if post_id:
            requested_blog = Post.query.filter_by(id=post_id).first()
            if requested_blog:
                return render_template("blog.html", post_id=requested_blog)
            else:
                abort(404)
    return redirect(url_for("home_page"))

@app.route("/modify", methods=["POST", "GET"])
@login_required
def modify_post():
    post_id = request.args.get("post_id")
    if post_id:
        post = Post.query.filter_by(id=post_id).first()
        if not post:
            flash(f"The blog not found", category="danger")
            return redirect(url_for("home_page"))
        if current_user.id != post.owner:
            flash("You do not have permission to modify this blog.", category="danger")
            return redirect(url_for("blog_page"))

    # Initialize form with existing post data
    form = PostForm(obj=post)

    if request.method == "POST":
        if form.validate_on_submit(): # Ensure the form is valid
        # Update specific blog if it exists
            post.title = form.title.data
            post.content = form.content.data
            modification_date = datetime.now()
            post.modification_date = modification_date
            db.session.commit()
            flash(f"The blog has been updated successfully.", category='success')
            return redirect(url_for("blog_page", post_id=post.id))
        else:
            # Render the form again with errors
            return render_template("modify.html", form=form, post=post)
    return render_template("modify.html", form=form, post=post)

@app.route("/delete", methods=["POST", "GET"])
@login_required  
def delete_page():
    # Canceling blog
    post_id = request.args.get("post_id")
    if post_id:
        post_to_delete = Post.query.filter_by(id=post_id).first()
        if not post_to_delete:
            flash(f"The blog not found", category="danger")
        elif current_user.id != post_to_delete.owner:
            flash(f"You do not heve permission to delete this blog", category="danger")
            return redirect(url_for("home_page"))
        else:
            db.session.delete(post_to_delete)
            db.session.commit()
            flash(f"The blog has been removed successfully", category="success")
    return redirect(url_for("home_page"))

# @app.route("/delete/<id>", methods=["POST"])
# @login_required  
# def delete_page(id):
    # Canceling blog
    # post = Post.query.filter_by(id=id).first()
    # if not post:
        # flash(f"The blog not found", category="danger")
    # elif current_user.id != post.owner:
        # flash(f"You do not heve permission to delete this blog", category="danger")
        # return redirect(url_for("home_page"))
    # else:
        # db.session.delete(post)
        # db.session.commit()
        # flash(f"The blog has been removed successfully", category="success")
    # return redirect(url_for("home_page"))


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
