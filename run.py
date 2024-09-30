from pencil import app
#from pencil.member_role import create_role_member

#Checks if the run.py file has executed directly and not imported
if __name__ == '__main__':
    #with app.app_context():
        #create_role_member()
    app.run(debug=True)