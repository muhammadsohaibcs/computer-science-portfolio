public class task11 {
    public static long reverse(long num){
        int digits = (int)(Math.log10(num))+1;
        if (digits<1){
            return 0;
        }
        return (long)(num%10 * Math.pow(10,digits-1)) + reverse(num/10);
    }
    public static boolean palindrome(long num){
        long num1 =reverse( num);
        if ( num1== num){
            return true;

        }
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(palindrome(787));
    }
}
