import java.util.Date;
class  Person{
    protected String address;
    protected String phoneNumber;
    protected String email;

    public Person() {
    }

    public Person(String address, String phoneNumber, String email) {
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }
    public void display(){
        System.out.println(address);
        System.out.println(phoneNumber);
        System.out.println(email);
    }
}
class Employee extends Person{
    String office ;
    double Salary;
    Date hiredate;
    public Employee() {
    }


    public Employee(String office, double Salary, Date hiredate) {
        this.office = office;
        this.Salary = Salary;
        this.hiredate = hiredate;
    }

    public Employee(String office, double Salary, Date hiredate, String address, String phoneNumber, String email) {
        super(address, phoneNumber, email);
        this.office = office;
        this.Salary = Salary;
        this.hiredate = hiredate;
    }
    


    
    
    public void display(){
        super.display();
        System.out.println("The office is " + office);
        System.out.println("The salary is " + Salary);
        System.out.println("The hire data is " + hiredate);
    }
}
class Student extends  Person{
    String status;

    public Student() {
    }

    public Student(String status) {
        this.status = status;
    }
    

    public Student(String status, String address, String phoneNumber, String email) {
        super(address, phoneNumber, email);
        this.status = status;
    }

    public void display() {
        
        super.display();
        System.out.println("The status is " + status);
    }
    
}
class Faculty extends  Employee{
    int officehours;
    String rank;

    public Faculty() {
    }

    public Faculty(int officehours, String rank) {
        this.officehours = officehours;
        this.rank = rank;
    }

    public Faculty(int officehours, String rank, String office, double Salary, Date hiredate) {
        super(office, Salary, hiredate);
        this.officehours = officehours;
        this.rank = rank;
    }

    public Faculty(int officehours, String rank, String office, double Salary, Date hiredate, String address, String phoneNumber, String email) {
        super(office, Salary, hiredate, address, phoneNumber, email);
        this.officehours = officehours;
        this.rank = rank;
    }
    
    
    
    public void display() {
        
        super.display();
        System.out.println("The office hours are " + officehours);
        System.out.println("The rank is " +rank);
    }
    

}
class StaffMember extends  Employee{
    String title;

    public StaffMember() {
    }

    public StaffMember(String title) {
        this.title = title;
    }

    public StaffMember(String title, String office, double Salary, Date hiredate) {
        super(office, Salary, hiredate);
        this.title = title;
    }

    public StaffMember(String title, String office, double Salary, Date hiredate, String address, String phoneNumber, String email) {
        super(office, Salary, hiredate, address, phoneNumber, email);
        this.title = title;
    }
}
class task1{
    public static void main(String[] args) {
        Employee a = new Employee("5",8,new Date(23, 3, 4),"78", "2", "3" );
        a.display();
        Faculty s = new Faculty(12,"D","5",8,new Date(23, 3, 4),"78", "2", "3" );
        s.display();
    }
}