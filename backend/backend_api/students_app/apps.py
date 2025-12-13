from django.apps import AppConfig


class StudentsAppConfig(AppConfig):
    name = 'students_app'

    def ready(self):
        import students_app.signals
