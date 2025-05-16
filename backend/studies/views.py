# studies/views.py
from django.http import FileResponse
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import Study
from .serializers import UserSerializer, StudySerializer
from rest_framework_simplejwt.views import TokenObtainPairView


# Registration
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# Login (JWT)
class LoginView(TokenObtainPairView):
    pass


# Upload DICOM
class StudyUploadView(generics.CreateAPIView):
    serializer_class = StudySerializer
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# List Studies (doctor only)
class StudyListView(generics.ListAPIView):
    serializer_class = StudySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # doctors see all, others see only their own
        if self.request.user.profile.role == "doctor":
            return Study.objects.all()
        return Study.objects.filter(uploaded_by=self.request.user)


# Download File
from rest_framework.views import APIView


class StudyDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        study = Study.objects.get(pk=pk)
        # permission: only uploader or doctor
        role = request.user.profile.role
        if study.uploaded_by != request.user and role != "doctor":
            return Response(status=status.HTTP_403_FORBIDDEN)
        return FileResponse(study.dicom_file.open(), as_attachment=True)


class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "username": user.username,
                "email": user.email,
                "role": user.profile.role,
            }
        )
