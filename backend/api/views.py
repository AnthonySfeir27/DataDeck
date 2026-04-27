from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.db import get_collection
from bson import ObjectId
import hashlib


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
