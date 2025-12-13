# Django Backend API Reference

This React frontend is configured to communicate with a Django backend. Here's the expected API structure:

## Configuration

Set your Django backend URL in `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

Or update the default in `src/services/api.ts`.

## Expected Django Endpoints

### Authentication

```
POST /api/auth/login/
Request: { "email": string, "password": string }
Response: { "token": string, "user": { "id": string, "email": string, "name": string, "role": string } }

POST /api/auth/logout/
Headers: Authorization: Bearer <token>
Response: 204 No Content

GET /api/auth/me/
Headers: Authorization: Bearer <token>
Response: { "id": string, "email": string, "name": string, "role": string }
```

### Students

```
GET /api/students/
Query Params: search, status, page
Response: { "results": Student[], "count": number }

GET /api/students/{id}/
Response: Student

GET /api/students/by-student-id/{studentId}/
Response: Student

GET /api/students/by-record-id/{recordId}/
Response: Student

POST /api/students/checkin/
Request: {
  "studentId": string,
  "studentName": string,
  "className": string,
  "studentPhoto": string (URL),
  "devicePhotos": string[] (URLs),
  "deviceDescription": string
}
Response: Student

POST /api/students/{studentId}/checkout/
Response: Student
```

### File Upload

```
POST /api/upload/
Content-Type: multipart/form-data
Body: file (File), type ("student" | "device")
Response: { "url": string }
```

## Student Model

```python
# Django Model Example
class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    class_name = models.CharField(max_length=200)
    photo = models.URLField()
    device_photos = models.JSONField(default=list)  # Array of URLs
    device_description = models.TextField()
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(choices=[('checked-in', 'Checked In'), ('checked-out', 'Checked Out')])
    record_id = models.CharField(max_length=50, unique=True)
```

## User Roles

Expected roles: `admin`, `staff`, `security`

## Switching to Real API

In `src/contexts/AuthContext.tsx` and `src/contexts/StudentContext.tsx`, set:
```typescript
const USE_MOCK_DATA = false;
```

## CORS Configuration (Django)

Add to your Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "https://your-production-domain.com",
]
```
