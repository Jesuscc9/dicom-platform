# studies/views.py
from django.http import FileResponse
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import Study
from .serializers import UserSerializer, StudySerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import StudyUploadSerializer

from pydicom import dcmread
from PIL import Image
import io
from django.core.files.base import ContentFile
from .filters import StudyFilter
from django_filters.rest_framework import DjangoFilterBackend
import numpy as np
import sys


# Registration
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# Login (JWT)
class LoginView(TokenObtainPairView):
    pass


# List Studies (doctor only)
class StudyUploadView(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudyUploadSerializer  # ← use the upload serializer

    def perform_create(self, serializer):
        study = serializer.save(uploaded_by=self.request.user)

        # read DICOM
        ds = dcmread(study.dicom_file.path)

        # metadata extraction (unchanged)…
        study.metadata = {
            "PatientName": str(getattr(ds, "PatientName", "")),
            "PatientID": str(getattr(ds, "PatientID", "")),
            "StudyDate": getattr(ds, "StudyDate", ""),
            "Modality": getattr(ds, "Modality", ""),
            "StudyDescription": getattr(ds, "StudyDescription", ""),
        }

        # only thumbnail if there *is* pixel data
        if hasattr(ds, "pixel_array"):
            try:
                arr = ds.pixel_array.astype(np.float32)

                # min–max normalize into 0–255
                arr -= arr.min()
                if arr.max() > 0:
                    arr = (arr / arr.max()) * 255.0
                arr = arr.clip(0, 255).astype(np.uint8)

                # create PIL image + thumbnail
                img = Image.fromarray(arr).convert("L")
                img.thumbnail((128, 128))

                buf = io.BytesIO()
                img.save(buf, format="PNG")
                buf.seek(0)

                study.thumbnail.save(
                    f"{study.id}_thumb.png", ContentFile(buf.read()), save=False
                )

            except Exception as err:
                # print full traceback so you see *why* it failed
                print("❌ Thumbnail generation failed:", file=sys.stderr)
                import traceback

                traceback.print_exc()

        # finally, save whatever changed (incl. thumbnail if set)
        study.save()


class StudyListView(generics.ListAPIView):
    serializer_class = StudySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = StudyFilter

    def get_queryset(self):
        user = self.request.user
        qs = (
            Study.objects.all()
            if user.profile.role == "doctor"
            else Study.objects.filter(uploaded_by=user)
        )
        return qs


class StudyDetailView(generics.RetrieveAPIView):
    serializer_class = StudySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Study.objects.all()
            if self.request.user.profile.role == "doctor"
            else Study.objects.filter(uploaded_by=self.request.user)
        )


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
