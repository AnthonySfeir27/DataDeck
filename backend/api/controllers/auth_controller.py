
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from api.models.user_model import (
    get_users_collection,
    hash_password,
    format_user_response,
    check_username_exists,
    check_email_exists,
    find_user_by_credentials,
)


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # --- Validation ---
    if not username or not email or not password:
        return Response(
            {'message': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if check_username_exists(username):
        return Response(
            {'message': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if check_email_exists(email):
        return Response(
            {'message': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Create user ---
    users = get_users_collection()
    user_data = {
        'username': username,
        'email': email,
        'password': hash_password(password)
    }
    result = users.insert_one(user_data)

    # --- Response ---
    user_data['_id'] = result.inserted_id
    return Response({
        'message': 'User created successfully',
        'user': format_user_response(user_data)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    """Main function: handles user authentication flow."""
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')

    # --- Validation ---
    if not username_or_email or not password:
        return Response(
            {'message': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Find user ---
    user = find_user_by_credentials(username_or_email)
    if not user:
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # --- Verify password ---
    if user['password'] != hash_password(password):
        return Response(
            {'message': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # --- Response ---
    return Response({
        'message': 'Login successful',
        'user': format_user_response(user)
    }, status=status.HTTP_200_OK)
