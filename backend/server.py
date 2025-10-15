from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI(title="Campus Manager API")
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class EnrollmentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    first_name: str
    last_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: UserRole
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    token: str
    user: User

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentCreate(BaseModel):
    user_id: str
    student_number: str
    department_id: str
    academic_year: str
    date_of_birth: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    student_number: str
    department_id: str
    academic_year: str
    date_of_birth: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    enrollment_status: EnrollmentStatus = EnrollmentStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeacherCreate(BaseModel):
    user_id: str
    employee_number: str
    department_id: str
    specialization: Optional[str] = None
    qualification: Optional[str] = None

class Teacher(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    employee_number: str
    department_id: str
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CourseCreate(BaseModel):
    name: str
    code: str
    department_id: str
    credits: int
    semester: int
    description: Optional[str] = None
    teacher_id: Optional[str] = None
    max_students: int = 50

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    department_id: str
    credits: int
    semester: int
    description: Optional[str] = None
    teacher_id: Optional[str] = None
    max_students: int = 50
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    status: EnrollmentStatus = EnrollmentStatus.PENDING
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExamCreate(BaseModel):
    course_id: str
    name: str
    exam_date: str
    start_time: str
    duration_minutes: int
    room: str
    max_score: float = 100.0
    supervisor_ids: Optional[List[str]] = []

class Exam(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    name: str
    exam_date: str
    start_time: str
    duration_minutes: int
    room: str
    max_score: float = 100.0
    supervisor_ids: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GradeCreate(BaseModel):
    student_id: str
    course_id: str
    exam_id: Optional[str] = None
    score: float
    max_score: float = 100.0
    comments: Optional[str] = None

class Grade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    exam_id: Optional[str] = None
    score: float
    max_score: float = 100.0
    percentage: float
    comments: Optional[str] = None
    graded_by: Optional[str] = None
    graded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttendanceCreate(BaseModel):
    student_id: str
    course_id: str
    date: str
    status: AttendanceStatus
    notes: Optional[str] = None

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    course_id: str
    date: str
    status: AttendanceStatus
    notes: Optional[str] = None
    marked_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str = "info"
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScheduleCreate(BaseModel):
    course_id: str
    day_of_week: int  # 0-6 (Monday-Sunday)
    start_time: str
    end_time: str
    room: str

class Schedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    day_of_week: int
    start_time: str
    end_time: str
    room: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(roles: List[UserRole]):
    async def role_checker(current_user: Dict = Depends(get_current_user)):
        if current_user['role'] not in [r.value for r in roles]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Auth Routes
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_pw = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone
    )
    
    doc = user.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get('is_active', True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    token = create_token(user['id'], user['role'])
    user_obj = User(**user)
    
    return TokenResponse(token=token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: Dict = Depends(get_current_user)):
    return User(**current_user)

# User Management Routes
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, is_active: bool, current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": is_active}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User status updated successfully"}

# Department Routes
@api_router.post("/departments", response_model=Department)
async def create_department(dept: DepartmentCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    department = Department(**dept.model_dump())
    doc = department.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.departments.insert_one(doc)
    return department

@api_router.get("/departments", response_model=List[Department])
async def get_departments(current_user: Dict = Depends(get_current_user)):
    departments = await db.departments.find({}, {"_id": 0}).to_list(1000)
    for dept in departments:
        if isinstance(dept.get('created_at'), str):
            dept['created_at'] = datetime.fromisoformat(dept['created_at'])
    return departments

# Student Routes
@api_router.post("/students", response_model=Student)
async def create_student(student_data: StudentCreate, current_user: Dict = Depends(get_current_user)):
    # Check if student number already exists
    existing = await db.students.find_one({"student_number": student_data.student_number})
    if existing:
        raise HTTPException(status_code=400, detail="Student number already exists")
    
    student = Student(**student_data.model_dump())
    doc = student.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.students.insert_one(doc)
    
    # Create notification
    notif = Notification(
        user_id=student.user_id,
        title="Inscription créée",
        message="Votre demande d'inscription a été soumise et est en attente d'approbation.",
        type="info"
    )
    notif_doc = notif.model_dump()
    notif_doc['created_at'] = notif_doc['created_at'].isoformat()
    await db.notifications.insert_one(notif_doc)
    
    return student

@api_router.get("/students", response_model=List[Student])
async def get_students(status: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if status:
        query['enrollment_status'] = status
    
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    for student in students:
        if isinstance(student.get('created_at'), str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    return students

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str, current_user: Dict = Depends(get_current_user)):
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if isinstance(student.get('created_at'), str):
        student['created_at'] = datetime.fromisoformat(student['created_at'])
    return Student(**student)

@api_router.patch("/students/{student_id}/status")
async def update_student_status(student_id: str, status: EnrollmentStatus, current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    result = await db.students.update_one(
        {"id": student_id},
        {"$set": {"enrollment_status": status.value}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get student to send notification
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if student:
        status_msg = "approuvée" if status == EnrollmentStatus.APPROVED else "rejetée"
        notif = Notification(
            user_id=student['user_id'],
            title=f"Inscription {status_msg}",
            message=f"Votre demande d'inscription a été {status_msg}.",
            type="success" if status == EnrollmentStatus.APPROVED else "warning"
        )
        notif_doc = notif.model_dump()
        notif_doc['created_at'] = notif_doc['created_at'].isoformat()
        await db.notifications.insert_one(notif_doc)
    
    return {"message": "Status updated successfully"}

# Teacher Routes
@api_router.post("/teachers", response_model=Teacher)
async def create_teacher(teacher_data: TeacherCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    teacher = Teacher(**teacher_data.model_dump())
    doc = teacher.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.teachers.insert_one(doc)
    return teacher

@api_router.get("/teachers", response_model=List[Teacher])
async def get_teachers(current_user: Dict = Depends(get_current_user)):
    teachers = await db.teachers.find({}, {"_id": 0}).to_list(1000)
    for teacher in teachers:
        if isinstance(teacher.get('created_at'), str):
            teacher['created_at'] = datetime.fromisoformat(teacher['created_at'])
    return teachers

# Course Routes
@api_router.post("/courses", response_model=Course)
async def create_course(course_data: CourseCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    course = Course(**course_data.model_dump())
    doc = course.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.courses.insert_one(doc)
    return course

@api_router.get("/courses", response_model=List[Course])
async def get_courses(department_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if department_id:
        query['department_id'] = department_id
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(1000)
    for course in courses:
        if isinstance(course.get('created_at'), str):
            course['created_at'] = datetime.fromisoformat(course['created_at'])
    return courses

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: Dict = Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if isinstance(course.get('created_at'), str):
        course['created_at'] = datetime.fromisoformat(course['created_at'])
    return Course(**course)

# Enrollment Routes
@api_router.post("/enrollments", response_model=Enrollment)
async def create_enrollment(enrollment_data: EnrollmentCreate, current_user: Dict = Depends(get_current_user)):
    # Check if already enrolled
    existing = await db.enrollments.find_one({
        "student_id": enrollment_data.student_id,
        "course_id": enrollment_data.course_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Check course capacity
    course = await db.courses.find_one({"id": enrollment_data.course_id})
    if course:
        enrolled_count = await db.enrollments.count_documents({
            "course_id": enrollment_data.course_id,
            "status": EnrollmentStatus.APPROVED.value
        })
        if enrolled_count >= course.get('max_students', 50):
            raise HTTPException(status_code=400, detail="Course is full")
    
    enrollment = Enrollment(**enrollment_data.model_dump())
    doc = enrollment.model_dump()
    doc['enrolled_at'] = doc['enrolled_at'].isoformat()
    await db.enrollments.insert_one(doc)
    return enrollment

@api_router.get("/enrollments", response_model=List[Enrollment])
async def get_enrollments(student_id: Optional[str] = None, course_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if student_id:
        query['student_id'] = student_id
    if course_id:
        query['course_id'] = course_id
    
    enrollments = await db.enrollments.find(query, {"_id": 0}).to_list(1000)
    for enrollment in enrollments:
        if isinstance(enrollment.get('enrolled_at'), str):
            enrollment['enrolled_at'] = datetime.fromisoformat(enrollment['enrolled_at'])
    return enrollments

@api_router.patch("/enrollments/{enrollment_id}/status")
async def update_enrollment_status(enrollment_id: str, status: EnrollmentStatus, current_user: Dict = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    result = await db.enrollments.update_one(
        {"id": enrollment_id},
        {"$set": {"status": status.value}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Status updated successfully"}

# Exam Routes
@api_router.post("/exams", response_model=Exam)
async def create_exam(exam_data: ExamCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    # Check for conflicts
    conflicts = await db.exams.find_one({
        "exam_date": exam_data.exam_date,
        "start_time": exam_data.start_time,
        "room": exam_data.room
    })
    if conflicts:
        raise HTTPException(status_code=400, detail="Exam schedule conflict detected")
    
    exam = Exam(**exam_data.model_dump())
    doc = exam.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.exams.insert_one(doc)
    
    # Notify enrolled students
    enrollments = await db.enrollments.find(
        {"course_id": exam.course_id, "status": EnrollmentStatus.APPROVED.value},
        {"_id": 0}
    ).to_list(1000)
    
    course = await db.courses.find_one({"id": exam.course_id})
    course_name = course['name'] if course else "Course"
    
    for enroll in enrollments:
        notif = Notification(
            user_id=(await db.students.find_one({"id": enroll['student_id']}))['user_id'],
            title="Nouvel examen programmé",
            message=f"Examen de {course_name}: {exam.name} le {exam.exam_date} à {exam.start_time} - Salle {exam.room}",
            type="info"
        )
        notif_doc = notif.model_dump()
        notif_doc['created_at'] = notif_doc['created_at'].isoformat()
        await db.notifications.insert_one(notif_doc)
    
    return exam

@api_router.get("/exams", response_model=List[Exam])
async def get_exams(course_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if course_id:
        query['course_id'] = course_id
    
    exams = await db.exams.find(query, {"_id": 0}).to_list(1000)
    for exam in exams:
        if isinstance(exam.get('created_at'), str):
            exam['created_at'] = datetime.fromisoformat(exam['created_at'])
    return exams

# Grade Routes
@api_router.post("/grades", response_model=Grade)
async def create_grade(grade_data: GradeCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    percentage = (grade_data.score / grade_data.max_score) * 100
    grade = Grade(
        **grade_data.model_dump(),
        percentage=percentage,
        graded_by=current_user['id']
    )
    doc = grade.model_dump()
    doc['graded_at'] = doc['graded_at'].isoformat()
    await db.grades.insert_one(doc)
    
    # Notify student
    student = await db.students.find_one({"id": grade.student_id})
    if student:
        course = await db.courses.find_one({"id": grade.course_id})
        course_name = course['name'] if course else "Course"
        notif = Notification(
            user_id=student['user_id'],
            title="Nouvelle note disponible",
            message=f"Votre note pour {course_name}: {grade.score}/{grade.max_score} ({percentage:.1f}%)",
            type="success"
        )
        notif_doc = notif.model_dump()
        notif_doc['created_at'] = notif_doc['created_at'].isoformat()
        await db.notifications.insert_one(notif_doc)
    
    return grade

@api_router.get("/grades", response_model=List[Grade])
async def get_grades(student_id: Optional[str] = None, course_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if student_id:
        query['student_id'] = student_id
    if course_id:
        query['course_id'] = course_id
    
    grades = await db.grades.find(query, {"_id": 0}).to_list(1000)
    for grade in grades:
        if isinstance(grade.get('graded_at'), str):
            grade['graded_at'] = datetime.fromisoformat(grade['graded_at'])
    return grades

# Attendance Routes
@api_router.post("/attendance", response_model=Attendance)
async def create_attendance(attendance_data: AttendanceCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    attendance = Attendance(**attendance_data.model_dump(), marked_by=current_user['id'])
    doc = attendance.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.attendance.insert_one(doc)
    return attendance

@api_router.get("/attendance", response_model=List[Attendance])
async def get_attendance(student_id: Optional[str] = None, course_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if student_id:
        query['student_id'] = student_id
    if course_id:
        query['course_id'] = course_id
    
    attendance = await db.attendance.find(query, {"_id": 0}).to_list(1000)
    for record in attendance:
        if isinstance(record.get('created_at'), str):
            record['created_at'] = datetime.fromisoformat(record['created_at'])
    return attendance

# Notification Routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: Dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for notif in notifications:
        if isinstance(notif.get('created_at'), str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    return notifications

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

# Schedule Routes
@api_router.post("/schedules", response_model=Schedule)
async def create_schedule(schedule_data: ScheduleCreate, current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    schedule = Schedule(**schedule_data.model_dump())
    doc = schedule.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.schedules.insert_one(doc)
    return schedule

@api_router.get("/schedules", response_model=List[Schedule])
async def get_schedules(course_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if course_id:
        query['course_id'] = course_id
    
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(1000)
    for schedule in schedules:
        if isinstance(schedule.get('created_at'), str):
            schedule['created_at'] = datetime.fromisoformat(schedule['created_at'])
    return schedules

# Dashboard Stats
@api_router.get("/stats/dashboard")
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    role = current_user['role']
    
    if role == UserRole.ADMIN.value:
        total_students = await db.students.count_documents({})
        pending_students = await db.students.count_documents({"enrollment_status": EnrollmentStatus.PENDING.value})
        total_teachers = await db.teachers.count_documents({})
        total_courses = await db.courses.count_documents({})
        total_exams = await db.exams.count_documents({})
        
        return {
            "total_students": total_students,
            "pending_students": pending_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "total_exams": total_exams
        }
    
    elif role == UserRole.TEACHER.value:
        teacher = await db.teachers.find_one({"user_id": current_user['id']})
        if not teacher:
            return {"courses": 0, "students": 0, "exams": 0}
        
        courses = await db.courses.count_documents({"teacher_id": teacher['id']})
        course_ids = [c['id'] async for c in db.courses.find({"teacher_id": teacher['id']}, {"id": 1})]
        enrollments = await db.enrollments.count_documents({
            "course_id": {"$in": course_ids},
            "status": EnrollmentStatus.APPROVED.value
        })
        exams = await db.exams.count_documents({"course_id": {"$in": course_ids}})
        
        return {
            "my_courses": courses,
            "total_students": enrollments,
            "upcoming_exams": exams
        }
    
    elif role == UserRole.STUDENT.value:
        student = await db.students.find_one({"user_id": current_user['id']})
        if not student:
            return {"courses": 0, "exams": 0, "average": 0}
        
        enrollments = await db.enrollments.count_documents({
            "student_id": student['id'],
            "status": EnrollmentStatus.APPROVED.value
        })
        course_ids = [e['course_id'] async for e in db.enrollments.find(
            {"student_id": student['id'], "status": EnrollmentStatus.APPROVED.value},
            {"course_id": 1}
        )]
        exams = await db.exams.count_documents({"course_id": {"$in": course_ids}})
        
        grades = await db.grades.find({"student_id": student['id']}, {"_id": 0}).to_list(1000)
        average = sum(g['percentage'] for g in grades) / len(grades) if grades else 0
        
        return {
            "enrolled_courses": enrollments,
            "upcoming_exams": exams,
            "average_grade": round(average, 2)
        }
    
    return {}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
