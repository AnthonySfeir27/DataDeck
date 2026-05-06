

from datetime import datetime
from bson import ObjectId
from api.db import get_collection

COLLECTION_NAME = 'tags'


def get_tags_collection():
    """Returns the MongoDB 'tags' collection."""
    return get_collection(COLLECTION_NAME)

def format_tag_response(tag_doc: dict) -> dict:
    """Converts a raw MongoDB tag document into an API-safe response dict."""
    return {
        'id': str(tag_doc['_id']),
        'name': tag_doc['name'],
        'created_at': tag_doc.get('created_at')
    }
