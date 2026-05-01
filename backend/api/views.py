from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.db import get_collection
from bson import ObjectId
import hashlib
from datetime import datetime
import base64


@api_view(['GET'])
def welcome(request):
    return Response({
        'message': 'Welcome to DataDeck'
    })


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response(
            {'message': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    users = get_collection('users')

    if users.find_one({'username': username}):
        return Response(
            {'message': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if users.find_one({'email': email}):
        return Response(
            {'message': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    user_data = {
        'username': username,
        'email': email,
        'password': hashed_password
    }

    result = users.insert_one(user_data)

    return Response({
        'message': 'User created successfully',
        'user': {
            'id': str(result.inserted_id),
            'username': username,
            'email': email
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response(
            {'message': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    users = get_collection('users')

    user = users.find_one({
        '$or': [
            {'username': username_or_email},
            {'email': username_or_email}
        ]
    })

    if not user:
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    if user['password'] != hashed_password:
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        'message': 'Login successful',
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user['email']
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_card(request):
    title = request.data.get('title')
    description = request.data.get('description')
    user_id = request.data.get('user_id')
    tags = request.data.get('tags', [])
    master_tag = request.data.get('master_tag')
    image_url = request.data.get('image_url')
    image_data = request.data.get('image_data')
    image_urls = request.data.get('image_urls', [])
    urls = request.data.get('urls', [])
    master_tag_data = request.data.get('master_tag_data', {})

    if not title or not user_id:
        return Response(
            {'message': 'Title and user_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cards = get_collection('cards')

    card_data = {
        'title': title,
        'description': description or '',
        'user_id': user_id,
        'tags': tags,
        'master_tag': master_tag,
        'image_url': image_url,
        'image_data': image_data,
        'image_urls': image_urls,
        'urls': urls,
        'master_tag_data': master_tag_data,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

    result = cards.insert_one(card_data)

    return Response({
        'message': 'Card created successfully',
        'card': {
            'id': str(result.inserted_id),
            'title': title,
            'description': description,
            'tags': tags,
            'master_tag': master_tag,
            'image_url': image_url,
            'image_data': image_data,
            'image_urls': image_urls,
            'urls': urls,
            'master_tag_data': master_tag_data,
            'created_at': card_data['created_at'],
            'updated_at': card_data['updated_at']
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_cards(request):
    user_id = request.query_params.get('user_id')

    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cards = get_collection('cards')
    user_cards = cards.find({'user_id': user_id})

    cards_list = []
    for card in user_cards:
        cards_list.append({
            'id': str(card['_id']),
            'title': card['title'],
            'description': card.get('description', ''),
            'tags': card.get('tags', []),
            'master_tag': card.get('master_tag'),
            'image_url': card.get('image_url'),
            'image_data': card.get('image_data'),
            'urls': card.get('urls', []),
            'master_tag_data': card.get('master_tag_data', {}),
            'created_at': card.get('created_at'),
            'updated_at': card.get('updated_at')
        })

    return Response({
        'cards': cards_list
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_card(request, card_id):
    title = request.data.get('title')
    description = request.data.get('description')
    tags = request.data.get('tags', [])
    master_tag = request.data.get('master_tag')
    image_url = request.data.get('image_url')
    image_data = request.data.get('image_data')
    image_urls = request.data.get('image_urls', [])
    urls = request.data.get('urls', [])
    master_tag_data = request.data.get('master_tag_data', {})

    if not title:
        return Response(
            {'message': 'Title is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    cards = get_collection('cards')

    update_data = {
        'title': title,
        'description': description or '',
        'tags': tags,
        'master_tag': master_tag,
        'image_url': image_url,
        'image_data': image_data,
        'image_urls': image_urls,
        'urls': urls,
        'master_tag_data': master_tag_data,
        'updated_at': datetime.utcnow().isoformat()
    }

    result = cards.update_one(
        {'_id': ObjectId(card_id)},
        {'$set': update_data}
    )

    if result.matched_count == 0:
        return Response(
            {'message': 'Card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'message': 'Card updated successfully',
        'card': {
            'id': card_id,
            'title': title,
            'description': description,
            'tags': tags,
            'master_tag': master_tag,
            'image_url': image_url,
            'image_data': image_data,
            'image_urls': image_urls,
            'urls': urls,
            'master_tag_data': master_tag_data,
            'updated_at': update_data['updated_at']
        }
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_card(request, card_id):
    cards = get_collection('cards')

    result = cards.delete_one({'_id': ObjectId(card_id)})

    if result.deleted_count == 0:
        return Response(
            {'message': 'Card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'message': 'Card deleted successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_tag(request):
    name = request.data.get('name')
    user_id = request.data.get('user_id')

    if not name or not user_id:
        return Response(
            {'message': 'Name and user_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    tags = get_collection('tags')

    existing_tag = tags.find_one({'name': name, 'user_id': user_id})
    if existing_tag:
        return Response(
            {'message': 'Tag with this name already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    tag_data = {
        'name': name,
        'user_id': user_id,
        'created_at': datetime.utcnow().isoformat()
    }

    result = tags.insert_one(tag_data)

    return Response({
        'message': 'Tag created successfully',
        'tag': {
            'id': str(result.inserted_id),
            'name': name,
            'created_at': tag_data['created_at']
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_tags(request):
    user_id = request.query_params.get('user_id')

    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    tags = get_collection('tags')
    user_tags = tags.find({'user_id': user_id})

    tags_list = []
    for tag in user_tags:
        tags_list.append({
            'id': str(tag['_id']),
            'name': tag['name'],
            'created_at': tag.get('created_at')
        })

    return Response({
        'tags': tags_list
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_tag(request, tag_id):
    tags = get_collection('tags')

    result = tags.delete_one({'_id': ObjectId(tag_id)})

    if result.deleted_count == 0:
        return Response(
            {'message': 'Tag not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'message': 'Tag deleted successfully'
    }, status=status.HTTP_200_OK)
