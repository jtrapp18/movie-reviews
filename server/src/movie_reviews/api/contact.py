import os
from threading import Thread

from flask import current_app, request
from flask_mail import Message
from flask_restful import Resource

from movie_reviews.config import mail


def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print("[DEBUG] Email sent successfully.")
        except Exception as e:
            print(f"[ERROR] Email delivery failed: {e}")


class Contact(Resource):

    # This MUST be lowercase 'post' and indented exactly like this
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

            app = current_app._get_current_object()
            Thread(target=send_async_email, args=(app, msg)).start()

            return {
                "status": "success",
                "message": "Message sent successfully!",
            }, 200

        except Exception as e:
            return {
                "status": "error",
                "message": f"Setup failed: {str(e)}",
            }, 500


def register_routes(api):
    api.add_resource(Contact, "/api/contact")
