from pencil import app
from flask import render_template, redirect, url_for, flash, request, abort
from werkzeug.utils import secure_filename
from pencil.models import Post, User, Comment, ReplyComment, Profile, Role
from pencil.forms import RegisterForm, LoginForm, PostForm, SearchForm, CommentForm, ReplyForm, ProfileForm
from sqlalchemy.orm import joinedload
#from pencil.member_role import create_role_member
from pencil import db
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
import os

@app.route("/")
@app.route("/home", methods=["GET", "POST"])
@login_required
def home_page():
    search_form = SearchForm()
    search_results = []

    if search_form.validate_on_submit(): 
        search_results = Post.query.filter(Post.title.ilike(f"%{search_form.input_search.data}%")).all()
        # If no results found, search by ID  
        if not search_results:
            search_results = Post.query.filter(Post.id.ilike(f"%{search_form.input_search.data}%")).all()
        # Flash a message if no results found after both searches  
        if not search_results:
            flash("No results found", category="info")
            return redirect(url_for("home_page", search_results=[]))  # Redirect with empty results
    # Fetch the latest posts  
    posts = Post.query.order_by(Post.title.desc()).limit(20).all()
    return render_template("home.html", posts=posts, search_form=search_form, search_results=search_results)


@app.route("/publish", methods=["POST", "GET"])
@login_required
def posting_page():
    post_form = PostForm()
    # Publishing a post
    if post_form.validate_on_submit(): # Ensure the form is valid
        try:
            print("Form data:", post_form.title.data, post_form.content.data)
            post_to_create = Post(title=post_form.title.data,
                                  content=post_form.content.data,
                                  owner=current_user.id)
            db.session.add(post_to_create)
            db.session.commit()
            post_id = post_to_create.id
            print("blog:", post_to_create.id)
            flash(f"The blog has been saved successfully", category="success")
            return redirect(url_for("blog_page", post_id=post_id))
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            flash("An error occurred while saving the post. Please try again.", category="danger")
    if post_form.errors != {}:
        for error_message in post_form.errors.values():
            flash(f"There is an error with adding: {error_message}", category="danger")
    return render_template("add_post.html", post_form=post_form)

@app.route("/blog", methods=["POST", "GET"])
@login_required
def blog_page():
    comment_form = CommentForm()
    reply_form = ReplyForm()

    post_id = request.args.get("post_id")
    if post_id:
        requested_blog = Post.query.filter_by(id=post_id).first()
        if requested_blog:
            if request.method == "POST":
                print("POST request received")
                if 'save' in request.form:
                    print("Save button clicked")
                    if requested_blog in current_user.archives:
                        flash("Blog is already saved.", category="info")
                    else:
                        current_user.archives.append(requested_blog)
                        db.session.commit()
                        flash(f"The blog is has been saved successfully", category="success")
                        return redirect(url_for("save_page"))

                if comment_form.validate_on_submit():
                    comment_to_post = Comment(text=comment_form.comment.data,
                                              comment_owner=current_user.id,
                                              comments_on_post=requested_blog.id)
                    db.session.add(comment_to_post)
                    db.session.commit()
                    comment_id = comment_to_post.id
                    flash(f"Thanks for your comment", category="success")
                    return redirect(url_for("blog_page", comment_id=comment_id))
                if  reply_form.validate_on_submit():
                    comment_id = request.form.get("comment_id")
                    if comment_id:
                        reply_to_post = ReplyComment(text=reply_form.reply.data, responder=current_user.id,
                                                     reply_comment=comment_id)
                        db.session.add(reply_to_post)
                        db.session.commit()
                        reply_id = reply_to_post.id
                        flash(f"Thanks for your comment", category="success")
                        return redirect(url_for("blog_page", reply_id=reply_id))
            if request.method == "GET":
                # Display a specific blog with its comments and the replies associated with those comments
                comment_with_replies = (db.session.query(Comment).outerjoin(ReplyComment, Comment.id == ReplyComment.reply_comment)
                                        .options(joinedload(Comment.reply_comments))  # Load replies with comments
                                        .filter(Comment.comments_on_post == post_id)
                                        .order_by(Comment.publication_date.desc(), ReplyComment.publication_date.desc()).all())

                return render_template("blog.html", post_id=requested_blog, comment_form=comment_form,
                                        posted_comments=comment_with_replies, reply_form=reply_form)
            else:
                flash(f"Blog not found", category="danger")
                return redirect(url_for("home_page"))
    for error_message in reply_form.errors.values():
        flash(f"There was an error : {error_message}", category="danger")
    return redirect(url_for("home_page"))

@app.route("/saved", methods=["GET", "POST"])
@login_required
def save_page():
    items = current_user.archives
    return render_template("saved_items.html", items=items)

@app.route("/modify-comment", methods=["POST", "GET"])
@login_required
def modify_comment():
    # Fetch the comment ID from request arguments
    comment_to_modify = request.args.get("comment_to_modify")
    if comment_to_modify is not None:
        commnts = Comment.query.filter_by(id=comment_to_modify).first()
        print("Comment retrieved:", commnts)  # Debugging print
        # Check if the comment exists
        if commnts is None:
            flash("Comment not found. Please try again.", category="danger")
            return redirect(url_for("blog_page"))

    # Initialize form with existing comment data
    form = CommentForm(obj=commnts)

    if request.method == "POST":
        if form.validate_on_submit():  # Ensure the form is valid
            # Update comment data
            commnts.text = form.comment.data
            commnts.modification_date = datetime.now()
            db.session.commit()
            flash("The comment has been updated successfully.", category='success')
            return redirect(url_for("blog_page", comment_to_modify=commnts.comments_on_post))
        else:
            return render_template("modify_comments.html", form=form, commnts=commnts)

    # Render the template whether or not the comment was found
    return render_template("modify_comments.html", form=form, commnts=commnts)


@app.route("/edit-reply-on-comment", methods=["POST", "GET"])
@login_required
def update_reply():
    # Fetch the comment ID from request arguments
    reply_to_modify = request.args.get("reply_to_modify")
    if reply_to_modify is not None:
        replies = ReplyComment.query.filter_by(id=reply_to_modify).first()
        # Check if the comment exists
        if replies is None:
            flash("Comment not found. Please try again.", category="danger")
            return redirect(url_for("blog_page"))

    # Initialize form with existing comment data
    form = ReplyForm(obj=replies)

    if request.method == "POST":
        if form.validate_on_submit():  # Ensure the form is valid
            # Update comment data
            replies.text = form.reply.data
            replies.modification_date = datetime.now()
            db.session.commit()
            flash("The comment has been updated successfully.", category='success')
            return redirect(url_for("blog_page", reply_to_modify=replies.reply_comment))
        else:
            return render_template("edit_reply_to_comment.html", form=form, replies=replies)

    # Render the template whether or not the comment was found
    return render_template("edit_reply_to_comment.html", form=form, replies=replies)

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

@app.route("/delete-comment", methods=["POST", "GET"])
@login_required  
def delete_comment():
    comment_id = request.args.get("comment_id")
    if comment_id:
        comment_to_delete = Comment.query.filter_by(id=comment_id).first()
        if not comment_to_delete:
            flash("The comment is no longer available.", category="danger")
            return redirect(url_for("home_page"))

        db.session.delete(comment_to_delete)
        db.session.commit()
        flash(f"The comment has been removed successfully", category="success")
    return redirect(url_for("blog_page", post_id=comment_to_delete.comments_on_post))

@app.route("/delete-reply-comment", methods=["POST", "GET"])
@login_required  
def delete_reply():
    reply_id = request.args.get("reply_id")
    if reply_id:
        reply_to_delete = ReplyComment.query.filter_by(id=reply_id).first()
        if not reply_to_delete:
            flash("The comment is no longer available.", category="danger")
            return redirect(url_for("home_page"))

        db.session.delete(reply_to_delete)
        db.session.commit()
        flash(f"The comment has been removed successfully", category="success")
    return redirect(url_for("blog_page", post_id=reply_to_delete.comments_on_post))

@app.route("/profile", methods=["GET"])
@login_required
def profile():

    profile_id =  request.args.get("profile_id")
    if profile_id:
        # Fetch the profile associated with the user
        profile_to_display = Profile.query.filter_by(users_profile=profile_id).first()
        print("profile retrieved:", profile_to_display)
        if profile_to_display:
            print("profile retrieved:", profile_to_display)
            return render_template("profile.html", profile_id=profile_to_display)
        else:
            flash(f"No profile with this name", category="danger")
            return redirect(url_for("home_page"))
    return redirect(url_for("home_page"))

@app.route("/update-profile", methods=["POST", "GET"])
@login_required
def edit_profile():
    profile_form = ProfileForm()
    # Fetch the current user's profile if it exists
    profile_to_update = Profile.query.filter_by(users_profile=current_user.id).first()
    if profile_to_update:
        profile_form = ProfileForm(obj=profile_to_update)
        if request.method == "POST":
            if profile_form.validate_on_submit():  # Ensure the form is valid
                if 'picture' in request.files:
                    file = request.files['picture']
                    if file.filename != '':
                        filename = secure_filename(file.filename)
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))  # Save the file
                        original_filename, extension = os.path.splitext(file.filename)
                        profile_to_update.profile_picture = f"{original_filename}{extension}"
                        db.session.commit()
                if profile_to_update:
                    # Update existing profile
                    profile_to_update.name = profile_form.name.data
                    profile_to_update.username = profile_form.username.data
                    profile_to_update.bio = profile_form.bio.data
                    profile_to_update.gmail_links = profile_form.gmail.data
                    profile_to_update.facebook_links = profile_form.facebook.data
                    profile_to_update.instagram_links = profile_form.instagram.data
                    profile_to_update.x_links = profile_form.x.data
                    profile_to_update.linkedin_links = profile_form.linkedin.data
                    profile_to_update.github_links = profile_form.github.data
                    db.session.commit()
                    flash("Your profile was updated successfully", category="success")
                    return redirect(url_for("profile"))
    else:
        if request.method == "POST":
            if profile_form.validate_on_submit():
                # Create a new profile if one does not exist
                profile_to_update = Profile(profile_picture=profile_form.picture.data,
                                            username=profile_form.username.data,
                                            name=profile_form.name.data,
                                            bio=profile_form.bio.data,
                                            gmail_links=profile_form.gmail.data,
                                            facebook_links=profile_form.facebook.data,
                                            instagram_links=profile_form.instagram.data,
                                            x_links=profile_form.x.data,
                                            linkedin_links=profile_form.linkedin.data,
                                            github_links=profile_form.github.data,
                                            users_profile=current_user.id)
                db.session.add(profile_to_update)
                db.session.commit()
                flash("Your profile was updated successfully", category="success")
                return redirect(url_for("profile"))

        # Handle validation errors
        for error_message in profile_form.errors.values():
            flash(f"There was an error updating your profile: {error_message}", category="danger")
    return render_template("modify_profile.html", form=profile_form, profile_to_update=profile_to_update)

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


    if request.method == "POST":
        if form.validate_on_submit():
            #user_to_create = User.query.filter_by(email=request.form.email_address).first()
            # if user already exists render the message
            #if user_to_create:
                #flash(f"The email address provided is already in use", category="danger")
                # render signup.html if user exists
                #return render_template('register.html')
            user_to_create = User(username=form.username.data,
                                  email=form.email_address.data,
                                  password=form.password1.data)

            #member_role = Role.query.filter_by(name='Member').first()
            #if member_role:  # Ensure the role exists
                #user_to_create.roles.append(member_role)
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
