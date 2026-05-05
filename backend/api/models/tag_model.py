"""
Tag Model
---------
Defines the Tag document schema and serialization helpers
for the 'tags' MongoDB collection.

Fields:
    _id        : ObjectId  (Primary Key)
    user_id    : str       (Foreign Key → users._id)
    name       : str       (unique per user)
    created_at : str       (Date – ISO timestamp)
"""

from datetime import datetime
from bson import ObjectId
from api.db import get_collection

COLLECTION_NAME = 'tags'


def get_tags_collection():
    """Returns the MongoDB 'tags' collection."""
    return get_collection(COLLECTION_NAME)


# ---------------------------------------------------------------------------
# Helpers – each serves exactly one purpose
# ---------------------------------------------------------------------------

def format_tag_response(tag_doc: dict) -> dict:
    """Converts a raw MongoDB tag document into an API-safe response dict."""
    return {
        'id': str(tag_doc['_id']),
        'name': tag_doc['name'],
        'created_at': tag_doc.get('created_at')
    }
