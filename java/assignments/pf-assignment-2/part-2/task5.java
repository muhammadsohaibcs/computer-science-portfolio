public class task5 {
    public static void main(String[] args) {
        String str = "mom";
        int s = 0;
        int e = str.length()-1;
        while (s<e){
            if (str.charAt(s)!= str.charAt(e)){
                System.out.println(false);
                break;

            }
            s++;
            e--;
        }
        if (s>=e){
            System.out.println(true);
        }
    }
}
