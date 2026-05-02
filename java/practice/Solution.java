import java.util.*;
class Solution {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        String a = sohaib.next();
        int i =0 ;
        while (i <a.length()){
            char  b = a.charAt(i); 
            String c = "" ;
            int k =i;
            if (Character.isDigit(b)){
                while (Character.isDigit(a.charAt(k))){
                    c+=a.charAt(k);
                    k++;
                }
                int d = Integer.parseInt(c);
                int j = 0;
                while (j <  d){
                    System.out.print(a.charAt(k));
                    j++;
                }

            }
            else
                System.out.print(a.charAt(i));
        i++;
        }
}
}   