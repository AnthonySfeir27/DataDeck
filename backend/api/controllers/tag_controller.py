from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from datetime import datetime

from api.models.tag_model import (
    get_tags_collection,
    format_tag_response,
)


@api_view(['POST'])
def create_tag(request):
    """Main function: validates uniqueness, creates tag, returns response."""
    name = request.data.get('name')
    user_id = request.data.get('user_id')

    # --- Validation ---
    if not name or not user_id:
        return Response(
            {'message': 'Name and user_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    tags = get_tags_collection()

    if tags.find_one({'name': name, 'user_id': user_id}):
        return Response(
            {'message': 'Tag with this name already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Create and persist ---
    tag_data = {
        'name': name,
        'user_id': user_id,
        'created_at': datetime.utcnow().isoformat()
    }
    result = tags.insert_one(tag_data)
    tag_data['_id'] = result.inserted_id

    # --- Response ---
    return Response({
        'message': 'Tag created successfully',
        'tag': format_tag_response(tag_data)
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_tags(request):
    """Main function: retrieves all tags for a user."""
    user_id = request.query_params.get('user_id')

    # --- Validation ---
    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Query and serialize ---
    tags = get_tags_collection()
    user_tags = tags.find({'user_id': user_id})
    tags_list = [format_tag_response(tag) for tag in user_tags]

    # --- Response ---
    return Response({'tags': tags_list}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_tag(request, tag_id):
    """Main function: deletes a tag by ID."""
    tags = get_tags_collection()

    result = tags.delete_one({'_id': ObjectId(tag_id)})

    # --- Error handling ---
    if result.deleted_count == 0:
        return Response(
            {'message': 'Tag not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({'message': 'Tag deleted successfully'}, status=status.HTTP_200_OK)
