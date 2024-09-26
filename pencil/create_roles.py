from pencil import app
from pencil import db
from pencil.models import User, Role

def create_roles():
    roles_user = [
        Role(id=1, name='Owner'),
        Role(id=2, name='Client'),
    ]

    for role in roles_user:
        existing_role = Role.query.filter_by(id=role.id).first()
        if not existing_role:
            db.session.add(role)

    db.session.commit()