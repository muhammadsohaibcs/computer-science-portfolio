import java.time.LocalDate;
import java.util.*;

abstract class Student {
    protected String studentId, name;
    protected ArrayList<Enrollment> enrollments = new ArrayList<>();

    public Student(String studentId, String name) {
        this.studentId = studentId;
        this.name = name ;
    }

    public abstract ArrayList<double[]> calculateGrade();

    public void enroll(Course course) {
        if (course == null) return;
        Enrollment enrollment = new Enrollment(this, course);
        enrollments.add(enrollment);
        course.getEnrollments().add(enrollment);
    }

    public ArrayList<Course> listCourses() {
        ArrayList<Course> courses = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            courses.add(enrollment.getCourse());
        }
        return courses;
    }

    public String getStudentId() { return studentId; }
    public String getName() { return name; }
}

class UndergraduateStudent extends Student {
    public UndergraduateStudent(String studentId, String name) { super(studentId, name); }

    @Override
    public ArrayList<double[]> calculateGrade() {
        ArrayList<double[]> grades = new ArrayList<>();
        for (int i = 0; i < enrollments.size(); i++) {
            Enrollment e = enrollments.get(i);
            ArrayList<Double> assignments = e.getAssignments();
            double avg = 0.0;
            if (!assignments.isEmpty()) {
                double sum = 0.0;
                for (Double score : assignments) sum += score;
                avg = sum / assignments.size();
            }
            double grade = avg * 0.3 + e.getParticipationScore() * 0.2 + e.getCourseGrade()* 0.5;
            grades.add(new double[]{i, grade});
        }
        return grades;
    }
}

class GraduateStudent extends Student {
    public GraduateStudent(String studentId, String name) { super(studentId, name); }

    @Override
    public ArrayList<double[]> calculateGrade() {
        ArrayList<double[]> grades = new ArrayList<>();
        for (int i = 0; i < enrollments.size(); i++) {
            Enrollment e = enrollments.get(i);
            ArrayList<Double> assignments = e.getAssignments();
            double avg = 0.0;
            if (!assignments.isEmpty()) {
                double sum = 0.0;
                for (Double score : assignments) sum += score;
                avg = sum / assignments.size();
            }
            double thesis = e.getThesisScore() != null ? e.getThesisScore() : 0;
            double grade = avg * 0.2 + e.getParticipationScore() * 0.2 + thesis * 0.3 + e.getCourseGrade()* 0.3;
            grades.add(new double[]{i, grade});
        }
        return grades;
    }
}

class ExchangeStudent extends Student {
    public ExchangeStudent(String studentId, String name) { super(studentId, name); }

    @Override
    public ArrayList<double[]> calculateGrade() {
        ArrayList<double[]> grades = new ArrayList<>();
        for (int i = 0; i < enrollments.size(); i++) {
            Enrollment e = enrollments.get(i);
            ArrayList<Double> assignments = e.getAssignments();
            double avg = 0.0;
            if (!assignments.isEmpty()) {
                double sum = 0.0;
                for (Double score : assignments) sum += score;
                avg = (sum / assignments.size()) >= 60.0 ? 1.0 : 0.0;
            }
            double grade = (avg * 0.2 + e.getParticipationScore() * 0.2 + e.getCourseGrade()* 0.6)>= 60.0 ? 1.0 : 0.0;
            grades.add(new double[]{i, grade});
        }
        return grades;
    }
}

abstract class Material {
    protected String materialId, title;

    public Material(String materialId, String title) {
        this.materialId = materialId ;
        this.title = title ;
    }

    public abstract void displayContent();

    public String getTitle() { return title; }
}

class Textbook extends Material {
    public Textbook(String materialId, String title) { super(materialId, title); }
    @Override
    public void displayContent() { System.out.println("Textbook: " + title); }
}

class VideoLecture extends Material {
    public VideoLecture(String materialId, String title) { super(materialId, title); }
    @Override
    public void displayContent() { System.out.println("Streaming: " + title); }
}

class Assignment extends Material {
    private LocalDate deadline;

    public Assignment(String materialId, String title, LocalDate deadline) {
        super(materialId, title);
        this.deadline = deadline ;
    }

    @Override
    public void displayContent() { System.out.println("Assignment: " + title + ", Due: " + deadline); }
}

class Module {
    private String moduleId, name;
    private ArrayList<Material> materials = new ArrayList<>();

    public Module(String moduleId, String name) {
        this.moduleId = moduleId ;
        this.name = name ;
    }

    public void addMaterial(Material material) {
        if (material != null) materials.add(material);
    }

    public ArrayList<Material> getMaterials() { return materials; }
    public String getName() { return name; }
}

class Course {
    private String courseId, name;
    private ArrayList<Module> modules = new ArrayList<>();
    private ArrayList<Enrollment> enrollments = new ArrayList<>();

    public Course(String courseId, String name) {
        this.courseId = courseId == null ? "" : courseId;
        this.name = name == null ? "" : name;
    }

    public void addModule(Module module) {
        if (module != null) modules.add(module);
    }

    public void assignCourseGrade(Scanner scanner) {
        System.out.println("Assign grades for course: " + name);
        for (Enrollment e : enrollments) {
            System.out.print("Grade for " + e.getStudent().getName() + " (0-100, -1 to skip): ");
            double grade = scanner.nextDouble();
            scanner.nextLine();
            if (grade >= 0 && grade <= 100) {
                e.setCourseGrade(grade);
            } else if (grade != -1) {
                System.out.println("Invalid grade, skipped.");
            }
        }
    }

    public ArrayList<Module> getModules() { return modules; }
    public ArrayList<Enrollment> getEnrollments() { return enrollments; }
    public String getName() { return name; }
}

class Enrollment {
    private Student student;
    private Course course;
    private LocalDate enrollmentDate;
    private ArrayList<Double> assignments = new ArrayList<>();
    private double courseGrade;
    private double participationScore;
    private Double thesisScore;

    public Enrollment(Student student, Course course) {
        this.student = student == null ? null : student;
        this.course = course == null ? null : course;
        this.enrollmentDate = LocalDate.now();
    }

    public void addAssignmentScore(double score) {
        if (score >= 0 && score <= 100) assignments.add(score);
    }

    public void setCourseGrade(double grade) {
        if (grade >= 0 && grade <= 100) this.courseGrade = grade;
    }

    public void setParticipationScore(double score) {
        this.participationScore = score >= 0 && score <= 100 ? score : 0.0;
    }

    public void setThesisScore(double score) {
        if (student instanceof GraduateStudent && score >= 0 && score <= 100) {
            this.thesisScore = score;
        }
    }

    public Student getStudent() { return student; }
    public Course getCourse() { return course; }
    public ArrayList<Double> getAssignments() { return assignments; }
    public double getCourseGrade() { return courseGrade; }
    public double getParticipationScore() { return participationScore; }
    public Double getThesisScore() { return thesisScore; }
}

public class Assignment3 {
    private static ArrayList<Course> courses = new ArrayList<>();
    private static ArrayList<Student> students = new ArrayList<>();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        while (true) {
            System.out.println("\nCourse Management System");
            System.out.println("1. Create Course");
            System.out.println("2. Add Module");
            System.out.println("3. Add Material");
            System.out.println("4. Enroll Student");
            System.out.println("5. Assign Course Grade");
            System.out.println("6. Assign Scores");
            System.out.println("7. Display Materials");
            System.out.println("8. Calculate Grades");
            System.out.println("9. View Student Courses");
            System.out.println("10. View Course Students");
            System.out.println("11. Delete Course");
            System.out.println("12. Exit");
            System.out.print("Choose: ");

            int choice = scanner.nextInt();
            scanner.nextLine();
            if (choice < 1 || choice > 12) {
                System.out.println("Invalid option.");
                continue;
            }
            if (choice == 12) {
                System.out.println("Exiting...");
                break;
            }

            switch (choice) {
                case 1: createCourse(); break;
                case 2: addModule(); break;
                case 3: addMaterial(); break;
                case 4: enrollStudent(); break;
                case 5: assignCourseGrade(); break;
                case 6: assignScores(); break;
                case 7: displayMaterials(); break;
                case 8: calculateGrades(); break;
                case 9: viewStudentCourses(); break;
                case 10: viewCourseStudents(); break;
                case 11: deleteCourse(); break;
            }
        }
        scanner.close();
    }

    private static void createCourse() {
        System.out.print("Course ID: ");
        String id = scanner.nextLine();
        System.out.print("Course name: ");
        String name = scanner.nextLine();
        courses.add(new Course(id, name));
        System.out.println("Course created: " + name);
    }

    private static void addModule() {
        Course course = selectCourse();
        if (course == null) return;
        System.out.print("Module ID: ");
        String id = scanner.nextLine();
        System.out.print("Module name: ");
        String name = scanner.nextLine();
        course.addModule(new Module(id, name));
        System.out.println("Module added: " + name);
    }

    private static void addMaterial() {
        Course course = selectCourse();
        if (course == null) return;
        ArrayList<Module> modules = course.getModules();
        System.out.println("Select module:");
        for (int i = 0; i < modules.size(); i++) {
            System.out.println((i + 1) + ". " + modules.get(i).getName());
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= modules.size()) {
            System.out.println("Invalid module.");
            return;
        }
        Module module = modules.get(idx);
        System.out.println("Type: 1. Textbook 2. Video 3. Assignment");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type < 1 || type > 3) {
            System.out.println("Invalid type.");
            return;
        }
        System.out.print("Material ID: ");
        String id = scanner.nextLine();
        System.out.print("Material title: ");
        String title = scanner.nextLine();
        Material material;
        if (type == 3) {
            System.out.print("Deadline year: ");
            int year = scanner.nextInt();
            System.out.print("Deadline month: ");
            int month = scanner.nextInt();
            System.out.print("Deadline day: ");
            int day = scanner.nextInt();
            scanner.nextLine();
            material = new Assignment(id, title, LocalDate.of(year, month, day));
        } else {
            material = type == 1 ? new Textbook(id, title) : new VideoLecture(id, title);
        }
        module.addMaterial(material);
        System.out.println("Material added: " + title);
    }

    private static void enrollStudent() {
        Course course = selectCourse();
        if (course == null) return;
        System.out.print("Student ID: ");
        String id = scanner.nextLine();
        System.out.print("Student name: ");
        String name = scanner.nextLine();
        System.out.println("Type: 1. Undergraduate 2. Graduate 3. Exchange");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type < 1 || type > 3) {
            System.out.println("Invalid type.");
            return;
        }
        Student student = type == 1 ? new UndergraduateStudent(id, name) :type == 2 ?new GraduateStudent(id, name) :new ExchangeStudent(id, name);
        students.add(student);
        student.enroll(course);
        System.out.println("Enrolled: " + name);
    }

    private static void assignCourseGrade() {
        Course course = selectCourse();
        if (course == null) return;
        course.assignCourseGrade(scanner);
    }

    private static void assignScores() {
        Course course = selectCourse();
        if (course == null) return;
        ArrayList<Enrollment> enrollments = course.getEnrollments();
        System.out.println("Select student:");
        for (int i = 0; i < enrollments.size(); i++) {
            System.out.println((i + 1) + ". " + enrollments.get(i).getStudent().getName());
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= enrollments.size()) {
            System.out.println("Invalid student.");
            return;
        }
        Enrollment e = enrollments.get(idx);
        System.out.print("Assignment score (0-100): ");
        double assignment = scanner.nextDouble();
        scanner.nextLine();
        e.addAssignmentScore(assignment);
        System.out.print("Participation score (0-100): ");
        double participation = scanner.nextDouble();
        scanner.nextLine();
        e.setParticipationScore(participation);
        if (e.getStudent() instanceof GraduateStudent) {
            System.out.print("Thesis score (0-100): ");
            double thesis = scanner.nextDouble();
            scanner.nextLine();
            e.setThesisScore(thesis);
        }
        System.out.println("Scores updated.");
    }

    private static void displayMaterials() {
        Course course = selectCourse();
        if (course == null) return;
        System.out.println("Materials for " + course.getName() + ":");
        for (Module m : course.getModules()) {
            System.out.println("Module: " + m.getName());
            for (Material mat : m.getMaterials()) mat.displayContent();
        }
    }

    private static void calculateGrades() {
        Student student = selectStudent();
        if (student == null) return;
        System.out.println("Grades for " + student.getName() + ":");
        ArrayList<double[]> grades = student.calculateGrade();
        for (double[] pair : grades) {
            int idx = (int) pair[0];
            double grade = pair[1];
            if (idx >= 0 && idx < student.enrollments.size()) {
                Course course = student.enrollments.get(idx).getCourse();
                System.out.printf("%s: %.2f%n", course.getName(), grade);
            }
        }
    }

    private static void viewStudentCourses() {
        Student student = selectStudent();
        if (student == null) return;
        System.out.println("Courses for " + student.getName() + ":");
        for (Course c : student.listCourses()) {
            System.out.println(c.getName());
        }
    }

    private static void viewCourseStudents() {
        Course course = selectCourse();
        if (course == null) return;
        System.out.println("Students in " + course.getName() + ":");
        for (Enrollment e : course.getEnrollments()) {
            System.out.println(e.getStudent().getName());
        }
    }

    private static void deleteCourse() {
        Course course = selectCourse();
        if (course == null) return;
        for (Enrollment e : course.getEnrollments()) {
            Student student = e.getStudent();
            if (student != null) {
                ArrayList<Enrollment> studentEnrollments = new ArrayList<>();
                for (Enrollment se : student.enrollments) {
                    if (se.getCourse() != course) {
                        studentEnrollments.add(se);
                    }
                }
                student.enrollments = studentEnrollments;
            }
        }
        courses.remove(course);
        System.out.println("Course deleted: " + course.getName());
    }

    private static Course selectCourse() {
        if (courses.isEmpty()) {
            System.out.println("No courses.");
            return null;
        }
        System.out.println("Select course:");
        for (int i = 0; i < courses.size(); i++) {
            System.out.println((i + 1) + ". " + courses.get(i).getName());
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= courses.size()) {
            System.out.println("Invalid course.");
            return null;
        }
        return courses.get(idx);
    }

    private static Student selectStudent() {
        if (students.isEmpty()) {
            System.out.println("No students.");
            return null;
        }
        System.out.println("Select student:");
        for (int i = 0; i < students.size(); i++) {
            System.out.println((i + 1) + ". " + students.get(i).getName());
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= students.size()) {
            System.out.println("Invalid student.");
            return null;
        }
        return students.get(idx);
    }
}