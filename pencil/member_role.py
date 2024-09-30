from pencil import db
from pencil.models import User, Role

def create_role_member():
    role_member = "Member"

    if role_member:
        if not Role.query.filter_by(name=role_member).first():
            role_to_create = Role(name=role_member)
            db.session.add(role_to_create)
    db.session.commit()