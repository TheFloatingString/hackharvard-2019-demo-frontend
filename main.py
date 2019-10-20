#main.py
import webapp2  #gives access to Google's deployment code
import jinja2
import os
from google.appengine.api import users
from models import Person, Message
from google.appengine.ext import ndb
import operator
import google.appengine.ext.db
#libraries for api_version
from google.appengine.api import urlfetch
import json

MESSAGE_PARENT = ndb.Key("Entity", "strong_consistency")


#This initializes the jinja2 environment
#TEMPLATE CODE FOR APPS / boiler plate code
jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)
jinja_env.globals.update(zip=zip)

# functions!!
def percentMatch(user, person):
    simScore = 0
    lppl = Person._properties
    for attr in lppl:
        if getattr(user, attr) == getattr(person, attr):
            simScore += 1
    return simScore



#handler section
class HomePage(webapp2.RequestHandler):
    #request handler is the parent
    #gives us access that everything webapp has in its code
    def get(self): #request of getting stuff from a website
        home_dict={
        }
        welcome_template = jinja_env.get_template("html/index.html")
        self.response.write(welcome_template.render(home_dict)) #render takes in the jinja dict



class TranslatePage(webapp2.RequestHandler):
    def get(self):
        places_template = jinja_env.get_template("/html/translation.html")
        self.response.write(places_template.render())

#initialization
app = webapp2.WSGIApplication(
    [
    ('/', HomePage),
    ('/Translate', Translate),
    ], debug = True

    #when you load up your application, and it ends w slash, this class should be handling all requests
    #reason it is an array is bc u can add others too
)
