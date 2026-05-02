import java.util.Scanner;
public class Task4 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println(" The number of minutes that is passed since midnight");
        int N = sohaib.nextInt();
        int hours =  N/60;
        int min = N% 60;
        System.out.println ( hours + " "+ min);
    }
    
}
