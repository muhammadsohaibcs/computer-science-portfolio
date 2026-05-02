import java.util.Scanner;
public class Task3 {
    public static Scanner sohaib = new Scanner(System.in);
        public static void main(String[] args) {
        String dic = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
        System.out.println("Press 1 for Encryption\nPress 2 for Decryption\nPress 3 for Exit");
        byte num = sohaib.nextByte();
        sohaib.nextLine();
        while (num!=3){
            String result =num==1?"The Encrypted String is \""+encryption(dic)+"\"":num==2?"The Decrypted String is \""+decryption(dic)+"\"":"You have entered an Invalid number";
            System.out.println(result);
            System.out.println("Press 1 for Encryption\nPress 2 for Decryption\nPress 3 for Exit");
            num = sohaib.nextByte();
            sohaib.nextLine();
        }
        System.out.println("You Exit Successfully\nGood Bye!");
    }
    public static String encryption(String dic){
        System.out.println("Enter a String");
        String st = sohaib.nextLine().toUpperCase();
        String str = checkString(st);
        System.out.println("Enter a key");
        String ky = sohaib.nextLine().toUpperCase();
        String key = checkString(ky);
        String newString = "";
        for (int i = 0,j=0; i < str.length(); i++,j++){
            if (i<key.length()){
                int k = dic.indexOf(str.charAt(i)) + dic.indexOf(key.charAt(j));
                int index = k>36? k%37:k;
                newString+=dic.charAt(index);
            }else{
                int k = dic.indexOf(str.charAt(i)) + dic.indexOf(key.charAt(j%(key.length()-1)));
                int index = k>36? k%37:k;
                newString+=dic.charAt(index);
            }
        }
        return newString;            
    }
    public static String decryption(String dic){
            System.out.println("Enter an Encrypted String");
            String st = sohaib.nextLine().toUpperCase();
            String str = checkString(st);
            System.out.println("Enter a key");
            String ky = sohaib.nextLine().toUpperCase();
            String key = checkString(ky);
            String newString = "";
            for (int i = 0,j=0; i < str.length(); i++,j++){
                if (i<key.length()){
                    int k = dic.indexOf(str.charAt(i)) - dic.indexOf(key.charAt(j));
                    int index = k<0? 37+k:k;
                    newString+=dic.charAt(index);
                }else{
                    int k = dic.indexOf(str.charAt(i)) - dic.indexOf(key.charAt(j%(key.length()-1)));
                    int index = k<0?37+k :k;
                    newString+=dic.charAt(index);
                }    
            }
            return newString;          
    }
    public static String checkString(String a ){
        for (int i = 0; i < a.length(); i++) {
            if ((Character.toString(a.charAt(i))).isBlank() || Character.isLetterOrDigit(a.charAt(i))){
                continue;
            }else{
                System.out.println("You have entered an invalid Input\nEnter it again");
                String newString= sohaib.nextLine();
                checkString(newString);
            }
        }
        return a;
    }
}

