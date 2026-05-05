"""
User Model
----------
Defines the User document schema, validation helpers, and query utilities
for the 'users' MongoDB collection.

Fields:
    _id       : ObjectId (Primary Key, auto-generated)
    username  : str      (unique)
    email     : str      (unique, Email type)
    password  : str      (SHA-256 hashed)
"""

import hashlib
from bson import ObjectId
from api.db import get_collection

COLLECTION_NAME = 'users'


def get_users_collection():
    """Returns the MongoDB 'users' collection."""
    return get_collection(COLLECTION_NAME)


# ---------------------------------------------------------------------------
# Helpers – each serves exactly one purpose
# ---------------------------------------------------------------------------

def hash_password(plain_password: str) -> str:
    """Hashes a plain-text password with SHA-256."""
    return hashlib.sha256(plain_password.encode()).hexdigest()


def format_user_response(user_doc: dict) -> dict:
    """Converts a raw MongoDB user document into an API-safe response dict."""
    return {
        'id': str(user_doc['_id']),
        'username': user_doc['username'],
        'email': user_doc['email']
    }


def find_user_by_id(user_id: str):
    """Finds a single user by ObjectId string. Returns None if not found."""
    users = get_users_collection()
    return users.find_one({'_id': ObjectId(user_id)})


def find_user_by_credentials(username_or_email: str):
    """Finds a user by matching either username or email."""
    users = get_users_collection()
    return users.find_one({
        '$or': [
            {'username': username_or_email},
            {'email': username_or_email}
        ]
    })


def check_username_exists(username: str, exclude_id: str = None) -> bool:
    """Returns True if the username is already taken (optionally excluding a user)."""
    users = get_users_collection()
    query = {'username': username}
    if exclude_id:
        query['_id'] = {'$ne': ObjectId(exclude_id)}
    return users.find_one(query) is not None


def check_email_exists(email: str, exclude_id: str = None) -> bool:
    """Returns True if the email is already taken (optionally excluding a user)."""
    users = get_users_collection()
    query = {'email': email}
    if exclude_id:
        query['_id'] = {'$ne': ObjectId(exclude_id)}
    return users.find_one(query) is not None
