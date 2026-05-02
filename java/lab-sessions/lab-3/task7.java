import java.util.Scanner;
public class task7 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("how many tickets for class A of seats were sold  : ");
        int classA = sohaib.nextInt();
        System.out.println("how many tickets for class B of seats were sold  : ");
        int classB = sohaib.nextInt();
        System.out.println("how many tickets for class C of seats were sold  : ");
        int classC = sohaib.nextInt();
        System.out.println("how many tickets for class D of seats were sold  : ");
        int classD = sohaib.nextInt();
        System.out.println("total income = " + (classA*20 + classB*15 + classC*10 + classD*5) );

    }
    
}
