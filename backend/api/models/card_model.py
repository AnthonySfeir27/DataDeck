"""
Card Model
----------
Defines the Card document schema, request parsing, and serialization helpers
for the 'cards' MongoDB collection.

Fields:
    _id            : ObjectId      (Primary Key)
    user_id        : str           (Foreign Key → users._id)
    title          : str           (required)
    description    : str
    master_tag     : str           (card type: note, task, movie, tv_series, book, game)
    tags           : list[str]     (Many-to-Many → tag names)
    image_url      : str
    image_data     : str           (File Image – base64)
    image_urls     : list[str]
    urls           : list[str]
    document_data  : str           (File PDF – base64)
    document_name  : str
    master_tag_data: dict          (type-specific nested fields with Date types)
    created_at     : str           (Date – ISO timestamp)
    updated_at     : str           (Date – ISO timestamp)
"""

from datetime import datetime
from bson import ObjectId
from api.db import get_collection

COLLECTION_NAME = 'cards'


def get_cards_collection():
    """Returns the MongoDB 'cards' collection."""
    return get_collection(COLLECTION_NAME)


# ---------------------------------------------------------------------------
# Helpers – each serves exactly one purpose
# ---------------------------------------------------------------------------

def build_card_from_request(request_data: dict) -> dict:
    """
    Extracts all card fields from a request data dict.
    Returns a clean dict ready for MongoDB insertion or update.
    """
    return {
        'title': request_data.get('title', ''),
        'description': request_data.get('description', '') or '',
        'user_id': request_data.get('user_id', ''),
        'tags': request_data.get('tags', []),
        'master_tag': request_data.get('master_tag', ''),
        'image_url': request_data.get('image_url', ''),
        'image_data': request_data.get('image_data', ''),
        'image_urls': request_data.get('image_urls', []),
        'urls': request_data.get('urls', []),
        'master_tag_data': request_data.get('master_tag_data', {}),
        'document_data': request_data.get('document_data', ''),
        'document_name': request_data.get('document_name', ''),
    }


def format_card_response(card_doc: dict, card_id: str = None) -> dict:
    """
    Converts a raw MongoDB card document (or a pre-built dict) into an
    API-safe response dict.  Eliminates the 3× serialization repetition.
    """
    return {
        'id': card_id or str(card_doc.get('_id', '')),
        'title': card_doc.get('title', ''),
        'description': card_doc.get('description', ''),
        'tags': card_doc.get('tags', []),
        'master_tag': card_doc.get('master_tag'),
        'image_url': card_doc.get('image_url'),
        'image_data': card_doc.get('image_data'),
        'image_urls': card_doc.get('image_urls', []),
        'urls': card_doc.get('urls', []),
        'master_tag_data': card_doc.get('master_tag_data', {}),
        'document_data': card_doc.get('document_data', ''),
        'document_name': card_doc.get('document_name', ''),
        'created_at': card_doc.get('created_at'),
        'updated_at': card_doc.get('updated_at'),
    }


def add_timestamps_for_create(card_data: dict) -> dict:
    """Adds created_at and updated_at timestamps to a new card."""
    now = datetime.utcnow().isoformat()
    card_data['created_at'] = now
    card_data['updated_at'] = now
    return card_data


def add_timestamp_for_update(card_data: dict) -> dict:
    """Adds updated_at timestamp to an existing card."""
    card_data['updated_at'] = datetime.utcnow().isoformat()
    return card_data
