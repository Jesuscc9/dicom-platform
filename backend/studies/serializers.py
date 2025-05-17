# studies/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile, Study


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(**validated_data)
        user.profile.role = role
        user.profile.save()
        return user


class StudyUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Study
        # only the file is writable on upload
        fields = ["dicom_file"]


class StudySerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(read_only=True)
    metadata = serializers.JSONField(read_only=True)
    dicom_file = serializers.FileField(read_only=True)

    class Meta:
        model = Study
        fields = ["id", "dicom_file", "thumbnail", "metadata", "uploaded_at"]
