"""
User Controller
---------------
Powers: Account Screen
Main functions handle flow (validation → model calls → response → errors).
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId

from api.models.user_model import (
    get_users_collection,
    hash_password,
    format_user_response,
    find_user_by_id,
    check_username_exists,
    check_email_exists,
)
from api.models.card_model import get_cards_collection
from api.models.tag_model import get_tags_collection


@api_view(['PUT'])
def update_profile(request):
    """Main function: validates uniqueness, updates profile fields, returns updated user."""
    user_id = request.data.get('user_id')
    username = request.data.get('username')
    email = request.data.get('email')

    # --- Validation ---
    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = find_user_by_id(user_id)
    if not user:
        return Response(
            {'message': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    update_data = {}

    if username and username != user.get('username'):
        if check_username_exists(username, exclude_id=user_id):
            return Response(
                {'message': 'Username already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )
        update_data['username'] = username

    if email and email != user.get('email'):
        if check_email_exists(email, exclude_id=user_id):
            return Response(
                {'message': 'Email already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )
        update_data['email'] = email

    if not update_data:
        return Response(
            {'message': 'No changes to update'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Persist ---
    users = get_users_collection()
    users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': update_data}
    )

    # --- Response ---
    updated_user = find_user_by_id(user_id)
    return Response({
        'message': 'Profile updated successfully',
        'user': format_user_response(updated_user)
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
def change_password(request):
    """Main function: verifies current password, updates to new password."""
    user_id = request.data.get('user_id')
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    # --- Validation ---
    if not user_id or not current_password or not new_password:
        return Response(
            {'message': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 6:
        return Response(
            {'message': 'New password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = find_user_by_id(user_id)
    if not user:
        return Response(
            {'message': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # --- Verify current password ---
    if user['password'] != hash_password(current_password):
        return Response(
            {'message': 'Current password is incorrect'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # --- Update password ---
    users = get_users_collection()
    users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'password': hash_password(new_password)}}
    )

    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_account(request):
    """Main function: deletes user and all associated cards and tags."""
    user_id = request.query_params.get('user_id')

    # --- Validation ---
    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = find_user_by_id(user_id)
    if not user:
        return Response(
            {'message': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # --- Delete associated data then user ---
    get_cards_collection().delete_many({'user_id': user_id})
    get_tags_collection().delete_many({'user_id': user_id})
    get_users_collection().delete_one({'_id': ObjectId(user_id)})

    return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
