#!/usr/bin/env python3

import os
import joblib
import requests
import uuid
import pandas as pd
from datetime import date
from datetime import datetime
# from flask_migrate import Migrate
from flask import request, session
from flask_restful import  Resource
from collections import Counter

from lib.config import app, db, api
from lib.models import User, Signup

@app.route('/')
def index():
    return app.send_static_file('index.html')

# @app.before_request
# def check_if_logged_in():
#     app.logger.debug(f"Request endpoint: {request.endpoint}")
#     if not session.get('user_id') \
#     and request.endpoint in ['spongebob']:
#     # and request.endpoint in ['hives', 'inspections', 'queens']:
#         return {'error': 'Unauthorized'}, 401
    
class ClearSession(Resource):

    def delete(self):
    
        session['user_id'] = None

        return {}, 204

class AccountSignup(Resource):
    def post(self):
        try:
            json = request.get_json()

            # Check if the username already exists in the database
            existing_user = User.query.filter_by(username=json['username']).first()

            # Check if the email already exists in the database
            existing_email = User.query.filter_by(email=json['email']).first()        

            error_dict = {}

            if existing_user:
                error_dict['username'] = 'Username already taken.'

            if existing_email:
                error_dict['email'] = 'Email already registered.'

            if existing_user or existing_email:
                return {'error': error_dict}, 400                

            user = User(
                username=json['username'],
                first_name=json['first_name'],
                last_name=json['last_name'],
                phone_number=json['phone_number'],
                email=json['email'],
                zipcode=json['zipcode']
                )
            
            user.password_hash = json['password']
            db.session.add(user)
            db.session.commit()

            session['user_id'] = user.id

            return user.to_dict(), 201
        except Exception as e:
            db.session.rollback()  # Rollback any changes made in the transaction
            return {'error': f'An error occurred: {str(e)}'}, 500
    

class CheckSession(Resource):

    def get(self):
        
        user_id = session.get('user_id', 0)
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return user.to_dict(), 200
        
        return {}, 204

class Login(Resource):
    def post(self):
        try:
            json = request.get_json()

            username = json['username']
            user = User.query.filter_by(username=username).first()

            if not user:
                return {'error': 'Invalid username or password'}, 401

            password = json['password']

            if user.authenticate(password):
                session['user_id'] = user.id
                return user.to_dict(), 200

            return {'error': 'Invalid username or password'}, 401
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500

class Logout(Resource):
    
    def delete(self):
        session['user_id'] = None
        return {}, 204

class UserById(Resource):

    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict(), 200
    
    def patch(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        data = request.get_json()

        # Check if username or email have changed
        if 'username' in data and data['username'] != user.username:
            user.username = data['username']

        if 'email' in data and data['email'] != user.email:
            # Check if the new email is already taken (excluding the current user)
            if db.session.query(User).filter(User.email == data['email'], User.id != user.id).first():
                return {'error': 'Email address is already in use.'}, 400
            user.email = data['email']

        # Update other fields
        for attr in data:
            if attr not in ['username', 'email']:  # Skip updating username and email if not changed
                setattr(user, attr, data.get(attr))

        db.session.commit()
        return user.to_dict(), 200

api.add_resource(ClearSession, '/api/clear', endpoint='clear')
api.add_resource(AccountSignup, '/api/account_signup', endpoint='account_signup')
api.add_resource(CheckSession, '/api/check_session')
api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(UserById, '/api/users/<int:user_id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
