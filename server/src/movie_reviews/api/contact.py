import os
from threading import Thread

from flask import current_app, request
from flask_mail import Message
from flask_restful import Resource

from movie_reviews.config import mail


def send_async_email(app, msg):
    """Sends the mail envelope using a separate background thread.

    This prevents Gunicorn from killing the worker process during long SMTP
    handshakes.
    """
    with app.app_context():
        try:
            mail.send(msg)
            print("[DEBUG LOG] Email sent successfully in the background!")
        except Exception as e:
            print(f"[ERROR LOG] Background email delivery failed: {e}")


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

            # Extract the raw core Flask instance to share with the thread worker
            app = current_app._get_current_object()

            # Disconnect the mail routine from the main request timeline
            Thread(target=send_async_email, args=(app, msg)).start()

            # Instantly tell your React frontend everything is good
            return {
                "status": "success",
                "message": "Message sent successfully!",
            }, 200

        except Exception as e:
            print(f"[ERROR LOG] Failed to initialize message: {e}")
            return {
                "status": "error",
                "message": "There was an error sending your message.",
            }, 500


def register_routes(api):
    api.add_resource(Contact, "/api/contact")
