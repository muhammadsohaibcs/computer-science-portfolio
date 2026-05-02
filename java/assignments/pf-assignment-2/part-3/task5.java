public class task5 {
    public static void main(String[] args) {
        System.out.println(countLetters("uiwe643856t"));
    }
    public static int countLetters(String s){
        int length = s.length();
        int count = 0;
        for (int idx = 0; idx < length; idx++) {
            if (Character.isLetter(s.charAt(idx)))
                count++;
        }
        return count;
    }
}
