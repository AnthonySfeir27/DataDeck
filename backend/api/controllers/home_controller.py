"""
Home Controller
---------------
Powers: Home Screen
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def welcome(request):
    """Main function: returns the welcome message."""
    return Response({'message': 'Welcome to DataDeck'})
