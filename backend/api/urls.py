from django.urls import path
from api.controllers.home_controller import welcome
from api.controllers.auth_controller import signup, login
from api.controllers.card_controller import create_card, get_cards, update_card, delete_card
from api.controllers.tag_controller import create_tag, get_tags, delete_tag
from api.controllers.user_controller import update_profile, change_password, delete_account

urlpatterns = [
    path('welcome/', welcome),
    path('signup/', signup),
    path('login/', login),
    path('cards/', get_cards),
    path('cards/create/', create_card),
    path('cards/<str:card_id>/update/', update_card),
    path('cards/<str:card_id>/delete/', delete_card),
    path('tags/', get_tags),
    path('tags/create/', create_tag),
    path('tags/<str:tag_id>/delete/', delete_tag),
    path('user/update/', update_profile),
    path('user/change-password/', change_password),
    path('user/delete/', delete_account),
]
