import java.util.Random;
public class task7 {
    public static void main(String[] args) {
        printMatrix(3);
    }
    public static void printMatrix(int n){
        Random ran = new Random();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print(ran.nextInt(2) +" ");
            }
            System.out.println();
        }
    }
}
