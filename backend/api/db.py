from pymongo import MongoClient
from django.conf import settings


def get_db():
    """
    Returns MongoDB database instance
    """
    client = MongoClient(settings.MONGODB_URI)
    return client[settings.MONGODB_NAME]


def get_collection(collection_name):
    """
    Returns a specific collection from MongoDB
    """
    db = get_db()
    return db[collection_name]
