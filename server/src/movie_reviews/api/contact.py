from flask import request
from flask_mail import Message
from flask_restful import Resource

from movie_reviews.config import app, mail  # however mail is set up in your config


class Contact(Resource):
    def post(self):
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        message = data.get("message")

        msg = Message(
            subject=f"Contact Form: {subject} - from {name}",
            recipients=[app.config["MAIL_USERNAME"]],
            body=f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}",
        )
        try:
            mail.send(msg)
            return {"status": "success", "message": "Message sent successfully!"}, 200
        except Exception as e:
            print(f"Error sending email: {e}")
            return {
                "status": "error",
                "message": "There was an error sending your message.",
            }, 500


def register_routes(api):
    api.add_resource(Contact, "/api/contact")
