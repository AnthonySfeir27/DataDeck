from django.urls import path
from . import views

urlpatterns = [
    path('welcome/', views.welcome, name='welcome'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('cards/', views.get_cards, name='get_cards'),
    path('cards/create/', views.create_card, name='create_card'),
    path('cards/<str:card_id>/update/', views.update_card, name='update_card'),
    path('cards/<str:card_id>/delete/', views.delete_card, name='delete_card'),
    path('tags/', views.get_tags, name='get_tags'),
    path('tags/create/', views.create_tag, name='create_tag'),
    path('tags/<str:tag_id>/delete/', views.delete_tag, name='delete_tag'),
    path('user/update/', views.update_profile, name='update_profile'),
    path('user/change-password/', views.change_password, name='change_password'),
    path('user/delete/', views.delete_account, name='delete_account'),
]
