public class task103 {
    public static void main(String[] args) {
        pattern(5, 0);
    }
    public static void pattern (int rows , int columns){
        if (rows ==0){
            return;
        }
        
        if (columns==(5-rows+1)){
            System.out.println();
            pattern(rows-1, 0);
        }
        else{
            System.out.print("*");
            pattern(rows, columns+1);
        }
    }
}
