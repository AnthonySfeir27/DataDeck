"""
Card Controller
---------------
Powers: Card Dashboard Screen
Main functions handle flow (validation → model calls → response → errors).
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId

from api.models.card_model import (
    get_cards_collection,
    build_card_from_request,
    format_card_response,
    add_timestamps_for_create,
    add_timestamp_for_update,
)


@api_view(['POST'])
def create_card(request):
    """Main function: validates input, builds card, persists, returns response."""
    title = request.data.get('title')
    user_id = request.data.get('user_id')

    # --- Validation ---
    if not title or not user_id:
        return Response(
            {'message': 'Title and user_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Build and persist ---
    cards = get_cards_collection()
    card_data = build_card_from_request(request.data)
    add_timestamps_for_create(card_data)

    result = cards.insert_one(card_data)

    # --- Response ---
    return Response({
        'message': 'Card created successfully',
        'card': format_card_response(card_data, card_id=str(result.inserted_id))
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_cards(request):
    """Main function: retrieves all cards for a user."""
    user_id = request.query_params.get('user_id')

    # --- Validation ---
    if not user_id:
        return Response(
            {'message': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Query and serialize ---
    cards = get_cards_collection()
    user_cards = cards.find({'user_id': user_id})
    cards_list = [format_card_response(card) for card in user_cards]

    # --- Response ---
    return Response({'cards': cards_list}, status=status.HTTP_200_OK)


@api_view(['PUT'])
def update_card(request, card_id):
    """Main function: validates, updates, returns updated card."""
    title = request.data.get('title')

    # --- Validation ---
    if not title:
        return Response(
            {'message': 'Title is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # --- Build update and persist ---
    cards = get_cards_collection()
    update_data = build_card_from_request(request.data)
    # Remove user_id from update (shouldn't change ownership)
    update_data.pop('user_id', None)
    add_timestamp_for_update(update_data)

    result = cards.update_one(
        {'_id': ObjectId(card_id)},
        {'$set': update_data}
    )

    # --- Error handling ---
    if result.matched_count == 0:
        return Response(
            {'message': 'Card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # --- Response ---
    return Response({
        'message': 'Card updated successfully',
        'card': format_card_response(update_data, card_id=card_id)
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_card(request, card_id):
    """Main function: deletes a card by ID."""
    cards = get_cards_collection()

    result = cards.delete_one({'_id': ObjectId(card_id)})

    # --- Error handling ---
    if result.deleted_count == 0:
        return Response(
            {'message': 'Card not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({'message': 'Card deleted successfully'}, status=status.HTTP_200_OK)
