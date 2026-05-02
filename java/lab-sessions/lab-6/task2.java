public class task2 {
    public static void main(String[] args) {
        star(3,3);
    }
    public static void star(int row ,int column){
        if (column >= 1){
            System.out.print("*"); 
            star(row, column-1);

        }
        if (row<=0){
            return;
        }
        if (column <=0){
            System.out.println();
            star(row-1,column);
        }

        
        
    }
}

