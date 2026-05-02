abstract class Person{
    private String name ;

    public Person() {
    }
    public Person(String name) {
        this.name = name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    
    public abstract boolean isOutStanding();

}
class Student extends Person{
    double cgpa ;

    public Student() {
    }

    public Student(double cgpa) {
        this.cgpa = cgpa;
    }

    public double getCgpa() {
        return cgpa;
    }

    public void setCgpa(double cgpa) {
        this.cgpa = cgpa;
    }
    @Override
    public boolean isOutStanding() {
        return cgpa > 3.5;
}
}
class Professor extends Person{
    int numberOfPublications;

    public Professor() {
    }

    public Professor(int numberOfPublications) {
        this.numberOfPublications = numberOfPublications;
    }

    public void setNumberOfPublications(int numberOfPublications) {
        if (numberOfPublications>100){
            this.numberOfPublications = numberOfPublications;
            isOutStanding();
            
        }
        this.numberOfPublications = numberOfPublications;
    }
    public int getNumberOfPublications() {
        return numberOfPublications;
    }

    @Override
    public boolean isOutStanding() {
        if (numberOfPublications>50){
            return true;
            
        }
        return false;
    }    
}
public class a{
    public static void main(String[] args) {
        Person arr[] = new Person[3];
        Student s = new Student(3.9);
        s.setName("yousaf");
        Professor p = new Professor(100);
        p.setName("Dr.Sohaib");
        arr[0]= s;
        arr[1]= p;
        for (int i = 0; i < 2; i++) {
            System.out.println("Name:" + arr[i].getName());
            System.out.println("Outstanding Remarks:"+ arr[i].isOutStanding());
        }


    }
}