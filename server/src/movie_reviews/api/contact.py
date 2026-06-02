import os
import traceback

from flask import request
from flask_mail import Message
from flask_restful import Resource

from movie_reviews.config import mail


class Contact(Resource):

    def post(self):
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        message = data.get("message")

        try:
            msg = Message(
                subject=f"Contact Form: {subject} - from {name}",
                recipients=[os.getenv("MAIL_RECIPIENT")],
                body=f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}",
            )

            # Send synchronously so we can catch any connection errors immediately
            mail.send(msg)

            return {
                "status": "success",
                "message": "Message sent successfully!",
            }, 200

        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "python_traceback": traceback.format_exc(),
            }, 500


def register_routes(api):
    api.add_resource(Contact, "/api/contact")
