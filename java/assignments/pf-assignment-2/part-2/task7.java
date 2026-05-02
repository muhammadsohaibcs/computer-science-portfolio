import java.util.Scanner;

public class task7 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        String a = sohaib.next();
        int b = a.indexOf("f");
        int c = a.lastIndexOf("f");
        if (c==-1 )
        System.out.println(b);
        else if (b==-1)
            System.out.println(c);
        else{
            System.out.print(b +" ");
            System.out.print(c);
        }


    }
}
