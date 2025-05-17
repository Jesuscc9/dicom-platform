import django_filters
from .models import Study


class StudyFilter(django_filters.FilterSet):
    patient_name = django_filters.CharFilter(
        field_name="metadata__PatientName", lookup_expr="icontains"
    )
    study_date = django_filters.DateFilter(
        field_name="metadata__StudyDate", lookup_expr="exact"
    )

    class Meta:
        model = Study
        fields = ["patient_name", "study_date"]
