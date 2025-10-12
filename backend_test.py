import requests
import sys
import json
from datetime import datetime

class CampusManagerTester:
    def __init__(self, base_url="https://campus-manager-24.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.departments = {}
        self.students = {}
        self.teachers = {}
        self.courses = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            return success, response.json() if response.content else {}, response.status_code
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_user_registration_and_login(self):
        """Test user registration and login for all roles"""
        print("\n🔍 Testing User Registration and Authentication...")
        
        # Test data for different roles
        test_users = [
            {
                "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "AdminPass123!",
                "role": "admin",
                "first_name": "Admin",
                "last_name": "User",
                "phone": "+216 12345678"
            },
            {
                "email": f"teacher_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "TeacherPass123!",
                "role": "teacher",
                "first_name": "Teacher",
                "last_name": "User",
                "phone": "+216 87654321"
            },
            {
                "email": f"student_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "StudentPass123!",
                "role": "student",
                "first_name": "Student",
                "last_name": "User",
                "phone": "+216 11223344"
            }
        ]

        for user_data in test_users:
            # Test registration
            success, response, status = self.make_request('POST', 'auth/register', user_data, expected_status=200)
            self.log_test(f"Register {user_data['role']} user", success, 
                         f"Status: {status}, Response: {response}")
            
            if success:
                self.users[user_data['role']] = {**user_data, 'id': response.get('id')}
                
                # Test login
                login_data = {"email": user_data['email'], "password": user_data['password']}
                success, response, status = self.make_request('POST', 'auth/login', login_data, expected_status=200)
                self.log_test(f"Login {user_data['role']} user", success,
                             f"Status: {status}, Response: {response}")
                
                if success and 'token' in response:
                    self.tokens[user_data['role']] = response['token']

    def test_departments(self):
        """Test department management (Admin only)"""
        print("\n🔍 Testing Department Management...")
        
        if 'admin' not in self.tokens:
            self.log_test("Department tests", False, "No admin token available")
            return

        admin_token = self.tokens['admin']
        
        # Create department
        dept_data = {
            "name": "Informatique",
            "code": "INFO",
            "description": "Département d'informatique et technologies"
        }
        
        success, response, status = self.make_request('POST', 'departments', dept_data, admin_token, expected_status=200)
        self.log_test("Create department", success, f"Status: {status}, Response: {response}")
        
        if success:
            self.departments['info'] = response
            
            # Get departments
            success, response, status = self.make_request('GET', 'departments', token=admin_token)
            self.log_test("Get departments", success and len(response) > 0, 
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_student_management(self):
        """Test student creation and management"""
        print("\n🔍 Testing Student Management...")
        
        if 'student' not in self.users or 'info' not in self.departments:
            self.log_test("Student management tests", False, "Missing prerequisites")
            return

        # Create student profile
        student_data = {
            "user_id": self.users['student']['id'],
            "student_number": f"STU{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "department_id": self.departments['info']['id'],
            "academic_year": "2024-2025",
            "date_of_birth": "2000-01-01",
            "address": "123 Test Street",
            "emergency_contact": "+216 99887766"
        }
        
        success, response, status = self.make_request('POST', 'students', student_data, 
                                                     self.tokens.get('student'), expected_status=200)
        self.log_test("Create student profile", success, f"Status: {status}, Response: {response}")
        
        if success:
            self.students['test_student'] = response
            
            # Get students (admin view)
            if 'admin' in self.tokens:
                success, response, status = self.make_request('GET', 'students', token=self.tokens['admin'])
                self.log_test("Get students list", success and len(response) > 0,
                             f"Status: {status}, Count: {len(response) if success else 0}")
                
                # Test student status update
                if self.students['test_student']:
                    student_id = self.students['test_student']['id']
                    success, response, status = self.make_request('PATCH', f'students/{student_id}/status?status=approved', 
                                                                 token=self.tokens['admin'])
                    self.log_test("Update student status", success, f"Status: {status}, Response: {response}")

    def test_teacher_management(self):
        """Test teacher creation and management"""
        print("\n🔍 Testing Teacher Management...")
        
        if 'teacher' not in self.users or 'info' not in self.departments or 'admin' not in self.tokens:
            self.log_test("Teacher management tests", False, "Missing prerequisites")
            return

        # Create teacher profile
        teacher_data = {
            "user_id": self.users['teacher']['id'],
            "employee_number": f"EMP{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "department_id": self.departments['info']['id'],
            "specialization": "Software Engineering",
            "qualification": "PhD in Computer Science"
        }
        
        success, response, status = self.make_request('POST', 'teachers', teacher_data, 
                                                     self.tokens['admin'], expected_status=200)
        self.log_test("Create teacher profile", success, f"Status: {status}, Response: {response}")
        
        if success:
            self.teachers['test_teacher'] = response
            
            # Get teachers
            success, response, status = self.make_request('GET', 'teachers', token=self.tokens['admin'])
            self.log_test("Get teachers list", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_course_management(self):
        """Test course creation and management"""
        print("\n🔍 Testing Course Management...")
        
        if 'info' not in self.departments or 'test_teacher' not in self.teachers or 'admin' not in self.tokens:
            self.log_test("Course management tests", False, "Missing prerequisites")
            return

        # Create course
        course_data = {
            "name": "Introduction à la Programmation",
            "code": "PROG101",
            "department_id": self.departments['info']['id'],
            "credits": 3,
            "semester": 1,
            "description": "Cours d'introduction à la programmation",
            "teacher_id": self.teachers['test_teacher']['id'],
            "max_students": 30
        }
        
        success, response, status = self.make_request('POST', 'courses', course_data, 
                                                     self.tokens['admin'], expected_status=200)
        self.log_test("Create course", success, f"Status: {status}, Response: {response}")
        
        if success:
            self.courses['prog101'] = response
            
            # Get courses
            success, response, status = self.make_request('GET', 'courses', token=self.tokens['admin'])
            self.log_test("Get courses list", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_enrollment_system(self):
        """Test course enrollment"""
        print("\n🔍 Testing Enrollment System...")
        
        if 'test_student' not in self.students or 'prog101' not in self.courses:
            self.log_test("Enrollment tests", False, "Missing prerequisites")
            return

        # Create enrollment
        enrollment_data = {
            "student_id": self.students['test_student']['id'],
            "course_id": self.courses['prog101']['id']
        }
        
        success, response, status = self.make_request('POST', 'enrollments', enrollment_data, 
                                                     self.tokens.get('student'), expected_status=200)
        self.log_test("Create enrollment", success, f"Status: {status}, Response: {response}")
        
        if success:
            # Get enrollments
            success, response, status = self.make_request('GET', 'enrollments', token=self.tokens['admin'])
            self.log_test("Get enrollments", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_exam_system(self):
        """Test exam creation and management"""
        print("\n🔍 Testing Exam System...")
        
        if 'prog101' not in self.courses or 'admin' not in self.tokens:
            self.log_test("Exam tests", False, "Missing prerequisites")
            return

        # Create exam
        exam_data = {
            "course_id": self.courses['prog101']['id'],
            "name": "Examen Final",
            "exam_date": "2024-12-15",
            "start_time": "09:00",
            "duration_minutes": 120,
            "room": "Salle A101",
            "max_score": 100.0,
            "supervisor_ids": []
        }
        
        success, response, status = self.make_request('POST', 'exams', exam_data, 
                                                     self.tokens['admin'], expected_status=200)
        self.log_test("Create exam", success, f"Status: {status}, Response: {response}")
        
        if success:
            # Get exams
            success, response, status = self.make_request('GET', 'exams', token=self.tokens['admin'])
            self.log_test("Get exams", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_grade_system(self):
        """Test grade management"""
        print("\n🔍 Testing Grade System...")
        
        if 'test_student' not in self.students or 'prog101' not in self.courses or 'teacher' not in self.tokens:
            self.log_test("Grade tests", False, "Missing prerequisites")
            return

        # Create grade
        grade_data = {
            "student_id": self.students['test_student']['id'],
            "course_id": self.courses['prog101']['id'],
            "score": 85.5,
            "max_score": 100.0,
            "comments": "Excellent travail"
        }
        
        success, response, status = self.make_request('POST', 'grades', grade_data, 
                                                     self.tokens['teacher'], expected_status=200)
        self.log_test("Create grade", success, f"Status: {status}, Response: {response}")
        
        if success:
            # Get grades
            success, response, status = self.make_request('GET', 'grades', token=self.tokens['teacher'])
            self.log_test("Get grades", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_attendance_system(self):
        """Test attendance tracking"""
        print("\n🔍 Testing Attendance System...")
        
        if 'test_student' not in self.students or 'prog101' not in self.courses or 'teacher' not in self.tokens:
            self.log_test("Attendance tests", False, "Missing prerequisites")
            return

        # Create attendance record
        attendance_data = {
            "student_id": self.students['test_student']['id'],
            "course_id": self.courses['prog101']['id'],
            "date": "2024-08-15",
            "status": "present",
            "notes": "Présent et actif"
        }
        
        success, response, status = self.make_request('POST', 'attendance', attendance_data, 
                                                     self.tokens['teacher'], expected_status=200)
        self.log_test("Create attendance record", success, f"Status: {status}, Response: {response}")
        
        if success:
            # Get attendance
            success, response, status = self.make_request('GET', 'attendance', token=self.tokens['teacher'])
            self.log_test("Get attendance records", success and len(response) > 0,
                         f"Status: {status}, Count: {len(response) if success else 0}")

    def test_notification_system(self):
        """Test notification system"""
        print("\n🔍 Testing Notification System...")
        
        for role in ['admin', 'teacher', 'student']:
            if role in self.tokens:
                success, response, status = self.make_request('GET', 'notifications', token=self.tokens[role])
                self.log_test(f"Get {role} notifications", success,
                             f"Status: {status}, Count: {len(response) if success else 0}")

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n🔍 Testing Dashboard Statistics...")
        
        for role in ['admin', 'teacher', 'student']:
            if role in self.tokens:
                success, response, status = self.make_request('GET', 'stats/dashboard', token=self.tokens[role])
                self.log_test(f"Get {role} dashboard stats", success,
                             f"Status: {status}, Stats: {response if success else 'None'}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Campus Manager API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Run tests in order (dependencies matter)
        self.test_user_registration_and_login()
        self.test_departments()
        self.test_student_management()
        self.test_teacher_management()
        self.test_course_management()
        self.test_enrollment_system()
        self.test_exam_system()
        self.test_grade_system()
        self.test_attendance_system()
        self.test_notification_system()
        self.test_dashboard_stats()
        
        # Print summary
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CampusManagerTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())