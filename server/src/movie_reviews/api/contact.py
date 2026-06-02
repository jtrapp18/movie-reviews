import os

import resend
from flask import request
from flask_restful import Resource


class Contact(Resource):

    def post(self):
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        message = data.get("message")

        try:
            # Trigger a clean, secure HTTP POST request over port 443
            resend.Emails.send(
                {
                    "from": f"Site Message from: {name} <onboarding@resend.dev>",  # Resend provides this default testing domain
                    "to": os.getenv("MAIL_RECIPIENT"),
                    "subject": f"Contact Form: {subject} - from {name}",
                    "text": f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}",
                }
            )

            return {
                "status": "success",
                "message": "Message sent successfully via API!",
            }, 200

        except Exception as e:
            print(f"[ERROR] API Email failed: {e}")
            return {
                "status": "error",
                "message": "There was an error routing your message via the web API.",
            }, 500


def register_routes(api):
    api.add_resource(Contact, "/api/contact")
