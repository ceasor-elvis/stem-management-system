from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import UserSerializer, StudentSerializer, CurrentUserSerializer
from .models import Student
import uuid
from datetime import datetime
from django.db.models import Q
from django.core.files.storage import default_storage
from django.contrib.auth.models import User
from .models import UserProfile

@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Find the user by email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=400)

    # Authenticate using username
    user = authenticate(username=user.username, password=password)

    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)

    token, _ = Token.objects.get_or_create(user=user)

    # Fetch role from profile
    profile = UserProfile.objects.get(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.first_name or user.username,
            "role": profile.role  # ← admin, security, staff
        }
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    request.auth.delete()
    return Response(status=204)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)

#========================================== STUDENTS =======================================================

# LIST STUDENTS
@api_view(["GET"])
def list_students(request):
    query = request.GET.get("search")
    status_filter = request.GET.get("status")

    qs = Student.objects.all()

    if query:
        qs = qs.filter(
            Q(name__icontains=query) |
            Q(student_id__icontains=query) |
            Q(class_name__icontains=query)
        )

    if status_filter:
        qs = qs.filter(status=status_filter)

    serializer = StudentSerializer(qs, many=True)
    return Response({"results": serializer.data, "count": qs.count()})


# GET STUDENT BY ID
@api_view(["GET"])
def get_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)
    print(StudentSerializer(student).data)
    return Response(StudentSerializer(student).data)


# GET BY STUDENT ID
@api_view(["GET"])
def get_by_student_id(request, studentId):
    try:
        student = Student.objects.get(student_id=studentId)
    except Student.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    return Response(StudentSerializer(student).data)


# GET BY RECORD ID
@api_view(["GET"])
def get_by_record_id(request, recordId):
    try:
        student = Student.objects.get(record_id=recordId)
    except Student.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    return Response(StudentSerializer(student).data)


# CHECK-IN
@api_view(["POST"])
def student_checkin(request):
    serializer = StudentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    student = serializer.save()

    return Response(serializer.data, status=201)

# CHECK-OUT
@api_view(["POST"])
def student_checkout(request, studentId):
    try:
        student = Student.objects.get(student_id=studentId)
    except Student.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    student.status = "checked-out"
    student.check_out_time = datetime.now()
    student.save()

    return Response(StudentSerializer(student).data)


#=========================== File Upload =================================
@api_view(["POST"])
def upload_file(request):
    file = request.FILES.get("file")
    file_type = request.data.get("type")  # student | device

    if not file_type or file_type not in ["student", "device"]:
        return Response({"detail": "Invalid type"}, status=400)

    filename = f"{file_type}/{uuid.uuid4()}-{file.name}"
    path = default_storage.save(filename, file)

    url = default_storage.url(path)
    return Response({"url": url})