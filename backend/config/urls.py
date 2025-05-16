# config/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from studies.views import (
    RegisterView,
    LoginView,
    StudyUploadView,
    StudyListView,
    StudyDownloadView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from studies.views import UserMeView

urlpatterns = [
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/studies/", StudyListView.as_view()),
    path("api/studies/upload/", StudyUploadView.as_view()),
    path("api/studies/<int:pk>/download/", StudyDownloadView.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", UserMeView.as_view(), name="me"),
]
