from pymongo import MongoClient
from django.conf import settings
from urllib.parse import quote_plus


def get_db():
    """
    Returns MongoDB database instance with automatic password encoding
    """
    uri = settings.MONGODB_URI

   
    if '@' in uri and '://' in uri:
        try:

            protocol_end = uri.find('://') + 3
            protocol = uri[:protocol_end]

            rest = uri[protocol_end:]
            at_pos = rest.rfind('@')

            if at_pos != -1:
                credentials = rest[:at_pos]
                host_and_params = rest[at_pos + 1:]

   
                if ':' in credentials:
                    username, password = credentials.split(':', 1)

              
                    encoded_username = quote_plus(username)
                    encoded_password = quote_plus(password)

           
                    uri = f'{protocol}{encoded_username}:{encoded_password}@{host_and_params}'
        except Exception as e:
            print(f"Warning: Could not auto-encode MongoDB URI: {e}")
            pass

   
    client = MongoClient(
        uri,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    return client[settings.MONGODB_NAME]


def get_collection(collection_name):

    db = get_db()
    return db[collection_name]