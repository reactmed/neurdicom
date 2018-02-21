from django.urls import path
from .views import *

urlpatterns = [

    # Plugins
    path('instances/<int:pk>/process', process_instance),
    path('plugins/<int:pk>', PluginDetailAPIView.as_view()),
    path('plugins', PluginsListAPIView.as_view())
]
