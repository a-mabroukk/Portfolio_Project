from flask_sqlalchemy import SQLAlchemy
from pencil import db


class BaseModel(db.Model):
    __abstract__ = True  # This ensures SQLAlchemy won't create a table for this class

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
