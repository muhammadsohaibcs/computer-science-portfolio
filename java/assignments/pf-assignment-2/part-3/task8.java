import java.util.Scanner;

public class task8 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter a String");
        String a = sohaib.nextLine();
        System.out.println(vowels( a));
    }
    public static int vowels(String a ){
        int count = 0;
        for (int i = 0; i < a.length(); i++) {
            if (a.charAt(i)=='a'||a.charAt(i)=='e'||a.charAt(i)=='i'||a.charAt(i)=='o'||a.charAt(i)=='u')
                count ++;
        }
        return count;
    }
}
