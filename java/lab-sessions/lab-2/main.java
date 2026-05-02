import java.util.Scanner;
public class main{
    public static void main(String[] args) {
        //Task1
        //a
        int num1,num2,num3,average;
        //b
        num1 = 125;
        num2 = 28;
        num3 = -25;
        //c
        average = (num1+num2+num3)/3;
        //d
        System.out.println("The average is " +average);
        //e
    // Task2
    Scanner sohaib =new Scanner(System.in);
    int length;
    System.out.println("Enter the length : ");
    length = sohaib.nextInt();
    int width;
    System.out.println("Enter the width : ");
    width = sohaib.nextInt();
    int area = length * width;
    System.out.println("Area = " + area);
    int perimeter = 2*(length* width);
    System.out.println("perimeter = " + perimeter);
    // Task 3
    //a
    //import java..util.Scanner;
    // b
    //Scanner console = new Scanner(System.in);
    //c
    final int SECRET = 11;
    final float RATE = 12.50f;
    //d
    int num4,num5,newNum;
    String hoursWorked;
    double wages;
    int num6;
    System.out.println("Enter the num1 : ");
    num6 = sohaib.nextInt();
    int num7;
    System.out.println("Enter the num2 : ");
    num7 = sohaib.nextInt();
    int temp = num6;
    num6 = num7;
    num7= temp;
    System.out.println( "num1 = " + num7 );
    System.out.println("num2 = " + num6);
    //f
    int num8= 8 ;
    int num9 = 5 ;
    System.out.println("THe value of num1 = "+ num8 + " and the value of num2 = " + num9);
    //g
    int num10 = 5 ;
    int num11 = 7 ;
    int newNum2 = (num10 * 2) + num11 ;
    System.out.println(newNum2);
    //h
    int NewNum = 23;
    int SECRET2 = 5;
    NewNum+=SECRET2;
    System.out.println(NewNum);

    //i
    System.out.println("Enter your last name : ");
    String name = sohaib.next();
    System.out.println(name);
    //j
    System.out.println("Enter a decimal number between 0 and 70");
    float hoursWorked2 = sohaib.nextFloat();
    //k
    final int RATE2 = 600;
    int hoursWorked3 = 7 ; 
    int wages2 = RATE2 * hoursWorked3 ;
    System.out.println(wages2 + "rupees");
    //l
    String name2 = "Rainbow";
    double RATE3 = 12.50;
    double hoursWorked4 = 45.50;
    double wages3 =  568.75;
    System.out.println("Name: " + name2);
    System.out.println("Pay Rate: $" + RATE3);
    System.out.println("Hours Worked: " + hoursWorked4);
    System.out.println("Salary; $" + wages3);
    }
}
