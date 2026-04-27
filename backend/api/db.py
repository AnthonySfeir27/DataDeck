from pymongo import MongoClient
from django.conf import settings
from urllib.parse import quote_plus


def get_db():
    """
    Returns MongoDB database instance with automatic password encoding
    """
    uri = settings.MONGODB_URI

    # Check if URI needs encoding (contains unencoded special chars in password)
    if '@' in uri and '://' in uri:
        try:
            # Split the URI
            protocol_end = uri.find('://') + 3
            protocol = uri[:protocol_end]

            # Find the @ that separates credentials from host
            rest = uri[protocol_end:]
            at_pos = rest.rfind('@')

            if at_pos != -1:
                credentials = rest[:at_pos]
                host_and_params = rest[at_pos + 1:]

                # Split credentials into username and password
                if ':' in credentials:
                    username, password = credentials.split(':', 1)

                    # Encode username and password
                    encoded_username = quote_plus(username)
                    encoded_password = quote_plus(password)

                    # Rebuild URI
                    uri = f'{protocol}{encoded_username}:{encoded_password}@{host_and_params}'
        except Exception as e:
            print(f"Warning: Could not auto-encode MongoDB URI: {e}")
            pass

    # Bypass SSL certificate verification for development (PyMongo 4.x syntax)
    client = MongoClient(
        uri,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    return client[settings.MONGODB_NAME]


def get_collection(collection_name):
    """
    Returns a specific collection from MongoDB
    """
    db = get_db()
    return db[collection_name]