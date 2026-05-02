
public class task1 {
    public static long sum(long digits){
        if (digits==0){
            return 0;
        }
        return ((digits%10)) + sum(digits/10); 
    }      
    public static void reverse(long digits){
        if (digits==0){
            return;
        }
        
        long num = digits%10;
        System.out.print(num);
        
        reverse(digits/10);
        

    }
    
    public static void main(String[] args) {
        System.out.println(sum(234));
        reverse(2345);
    }
}
