public class lab9 {
    public static void main(String[] args) {
        String a = "hello";
        System.out.println(a.charAt(2));
        System.out.println(a.charAt(a.length()-2));
        System.out.println(a.substring(0,5));
        System.out.println(a.substring(0,a.length()-2));
        for (int i = 0; i < a.length(); i+=2) {
            System.out.print(a.charAt(i));   
        }
        System.out.println();
        for (int i = 1; i < a.length(); i+=2) {
            System.out.print(a.charAt(i));   
        }
        System.out.println();
        for (int i = a.length()-1; i > -1; i--) {
            System.out.print(a.charAt(i));   
        }
        System.out.println();
        for (int i = a.length()-1; i > -1; i-=2) {
            System.out.print(a.charAt(i));   
        }
        System.out.println();
        System.out.println(a.length());

    }
}
