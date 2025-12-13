from django.urls import path
from .views import login, logout, me, list_students, get_by_student_id, get_student, get_by_record_id, student_checkout, student_checkin, upload_file

urlpatterns = [
    # Auth
    path("auth/login/", login),
    path("auth/logout/", logout),
    path("auth/me/", me),

    # Students
    path("students/", list_students),
    path("students/by-student-id/<str:studentId>/", get_by_student_id),
    path("students/by-record-id/<str:recordId>/", get_by_record_id),
    path("students/checkin/", student_checkin),
    path("students/<str:id>/", get_student),
    path("students/<str:studentId>/checkout/", student_checkout),

    # Upload
    path("upload/", upload_file),
]
