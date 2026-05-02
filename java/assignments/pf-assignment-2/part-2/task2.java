import java.util.Scanner;

public class task2 {
    public static void main (String[] args){
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter an ASCII Code : ");
        byte num = sohaib.nextByte();
        System.out.println("The character for ASCII code "+ num + " is " + (char)(num));
        System.out.println("Enter a character : ");
        char a = sohaib.next().charAt(0);
        System.out.println("The Unicode for the character " + a + " is " + (byte)(a));
    }
}
