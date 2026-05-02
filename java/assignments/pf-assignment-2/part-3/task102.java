public class task102 {
    public static void main(String[] args) {
        pattern(5, 0);
    }
    public static void pattern (int rows , int columns){
        if (rows ==0){
            return;
        }
        if (columns==5){
            System.out.println();
            pattern(rows-1, 0);
        }
        else if (columns+1<rows){
            System.out.print(" ");
            pattern(rows, columns+1);
        }
        else{
            System.out.print("*");
            pattern(rows, columns+1);
        }

    }
}
