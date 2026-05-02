import java.util.*;
class Student {
    String name;
    String regNo;
    public void setValues (String n , String r){
        name = n;
        regNo = r;
    }
    public void display (){
        System.out.println("The name is " + name );
        System.out.println("The Reg Number is " + regNo );
    }
}
class Time {
    int min ;
    int sec ;
    int hours ;
    public void setPar (int s, int m , int h){
        sec =s;
        min = m;
        hours = h;

    }
    public void display (){
        System.out.println("the time is " + hours + ":" + min + ":"+ sec);
    }
}

class bus {
    String busType ;
    String busPath;


    public void setPar (String a , String b){
       busType = a;
       busPath = b;

    }
    public void display (){
        System.out.println("the Bus Type is " + busType + " and Bus Path is " + busPath);
    }
}
class Rectangle {
    double length ;
    double width ;
    public void display (){
        System.out.println("the length is " + length );
        System.out.println("the width is " + width);
    }
    public double area (){
        return length * width;
    }
    public void perimeter (){
        System.out.println("The perimeter is " + (length + width)/2);
    }
}
public class gradedtasks {
    public static void main(String[] args) {
        System.out.println("******************Task1******************");
        Student s1 = new Student();
        s1.name = "sohaib";
        s1.regNo = "SP24-BCS-072";
        s1.display();
        System.out.println("******************Task2******************");
        Time t1 = new Time();
        t1.setPar(12, 34, 01);
        t1.display();
        System.out.println("******************Task3******************");
        bus b1 = new bus();
        b1.setPar("Electric","Islamabad");
        b1.display();
        System.out.println("******************Task4******************");
        Rectangle r1 = new Rectangle();
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter Length : " );
        double l = sohaib.nextDouble();
        System.out.println("Enter Width : " );
        double w = sohaib.nextDouble();
        r1.length = l;
        r1.width = w;
        r1.display();
        double a = r1.area();
        System.out.println(a);
        r1.perimeter();

    }
}
