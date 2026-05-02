public class shift{
    public static void main (String[] args){
        int key = 90;
        String a = "ghtay";
        int b = a.length();
        int i =0;
        String newstring = "";
        while (i < b){
            newstring+=(char)(a.charAt(i)^key);
            i++;

        }
        System.out.println(newstring);
        String r = "";
        for (int j = 0; j < newstring.length(); j++){
        r+=(char)(newstring.charAt(j)^key);
        }
        System.out.println(r);

    }
}