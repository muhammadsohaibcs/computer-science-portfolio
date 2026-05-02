import java.util.Scanner;
public class paractice {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        int age = sohaib.nextInt();
        byte qage = 123;
        int n = qage + qage ;
        for (int i = 0, j = 0; (i + j < 10); i++, j++) {
            System.out.println(i);
            System.out.println(j);
        }
        char c = (int)'c';
        System.out.println(c);
        String sd= "aa"+"bmmmmm";
        System.out.println(sd);
        System.out.println(Math.rint(2.8));
        float d = (float)age;
        System.out.println(d);
        boolean number = age%2==0;
        String name = "sohaib";
        int s = (int)23.3/2;
        float t = (float)7;
        int year = sohaib.nextInt();
        double newly = (double)23/2;
        System.out.println(newly);
        if (age>=18)
            if (year>=2)
            System.out.println("eligible");
            else
            System.out.println("Not eligible");
            else{
            System.out.println("ty");
            System.out.println(number);}
        switch (name) {
            case "sohaib":
                System.out.println(12);
                break;
                case "waqar":
                System.out.println(12);
                break;
    
        }
    }
}