import uuid
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("security", "Security"),
        ("staff", "Staff"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.CharField(max_length=50, unique=True)
    record_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) # TODO Fix this if needed
    name = models.CharField(max_length=200)
    class_name = models.CharField(max_length=200)
    photo = models.URLField()
    device_photos = models.JSONField(default=list)
    device_description = models.TextField()
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[("checked-in", "Checked In"), ("checked-out", "Checked Out")],
        default="checked-in"
    )

    def __str__(self):
        return self.name
