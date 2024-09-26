from pencil import app
from pencil.create_roles import create_roles

#Checks if the run.py file has executed directly and not imported
if __name__ == '__main__':
    with app.app_context():
        create_roles()
    app.run(debug=True)