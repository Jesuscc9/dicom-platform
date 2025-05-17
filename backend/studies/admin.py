# backend/studies/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import Study, Profile


@admin.register(Study)
class StudyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "uploaded_by",
        "get_patient_name",
        "get_patient_id",
        "get_study_date",
        "get_modality",
        "thumbnail_tag",
        "uploaded_at",
    )
    # Only filter on actual model fields
    list_filter = ("uploaded_by",)
    search_fields = (
        "metadata__PatientName",
        "metadata__PatientID",
    )

    def get_patient_name(self, obj):
        metadata = obj.metadata or {}
        return metadata.get("PatientName", "")

    get_patient_name.short_description = "Patient Name"

    def get_patient_id(self, obj):
        metadata = obj.metadata or {}
        return metadata.get("PatientID", "")

    get_patient_id.short_description = "Patient ID"

    def get_study_date(self, obj):
        metadata = obj.metadata or {}
        return metadata.get("StudyDate", "")

    get_study_date.short_description = "Study Date"

    def get_modality(self, obj):
        metadata = obj.metadata or {}
        return metadata.get("Modality", "")

    get_modality.short_description = "Modality"

    def thumbnail_tag(self, obj):
        if obj.thumbnail and hasattr(obj.thumbnail, "url"):
            return format_html(
                '<img src="{}" width="64" height="64" style="object-fit: cover;"/>',
                obj.thumbnail.url,
            )
        return "-"

    thumbnail_tag.short_description = "Thumbnail"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email")
