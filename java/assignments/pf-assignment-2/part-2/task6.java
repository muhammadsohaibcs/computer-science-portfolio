import java.util.Scanner;
public class task6 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner (System.in);
        String words;
        while (true){
            words = sohaib.nextLine().trim();
            if (words.indexOf(" ")==words.lastIndexOf(" "))
                break;
        }
        System.out.println(words.substring(words.indexOf(" ")+1)+" "+ words.substring(0, words.indexOf(" ")));

    }
}
