public class task1 {
    public static int reverse(int number){
        int reversed = 0;
        while (true){
            if (number==0){
                return reversed;
            }
            reversed = reversed*10 + number%10; 
            System.out.println(number /=10); 
        }
    }
    public static boolean isPalindrome(int number) {
        int check = reverse(number);
        if (check == number){
            return true;
        }
        else
            return false;
        }
    public static void main(String[] args) {
        System.out.println(reverse(12));
        System.out.println(isPalindrome(1891));
    }
}
