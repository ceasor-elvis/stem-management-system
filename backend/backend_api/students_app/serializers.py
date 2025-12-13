from rest_framework import serializers
from .models import Student
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name"]

class StudentSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student_id', required=True)
    studentName = serializers.CharField(source='name', required=True)           # ← map studentName
    className = serializers.CharField(source='class_name', required=True)
    studentPhoto = serializers.URLField(source='photo', required=True)          # ← map studentPhoto
    devicePhotos = serializers.ListField(source='device_photos', required=True)
    deviceDescription = serializers.CharField(source='device_description', required=True)
    checkInTime = serializers.DateTimeField(source='check_in_time', read_only=True)
    checkOutTime = serializers.DateTimeField(source='check_out_time', read_only=True)
    status = serializers.ChoiceField(
        choices=[('checked-in', 'Checked In'), ('checked-out', 'Checked Out')],
        required=False
    )
    recordId = serializers.CharField(source='record_id', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'studentId',
            'studentName',
            'className',
            'studentPhoto',
            'devicePhotos',
            'deviceDescription',
            'checkInTime',
            'checkOutTime',
            'status',
            'recordId',
        ]

class CurrentUserSerializer(serializers.Serializer):
    id = serializers.CharField(source='pk')
    email = serializers.EmailField()
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.first_name or obj.username

    def get_role(self, obj):
        return obj.userprofile.role