# studies/apps.py
from django.apps import AppConfig


class StudiesConfig(AppConfig):
    name = "studies"

    def ready(self):
        import studies.signals
