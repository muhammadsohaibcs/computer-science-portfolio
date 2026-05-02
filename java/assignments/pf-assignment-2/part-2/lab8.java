import java.util.Scanner;

public class lab8 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        String a = sohaib.nextLine();
        System.out.println(a.substring(0, a.indexOf('h'))+ a.substring(a.lastIndexOf('h')+1));
    }
}
