
import java.util.Scanner;

public class arraypractice2 {

    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        int rows = sohaib.nextInt();
        int max = 0;
        int[][] arr = new int[rows][];
        for (int i = 0; i < rows; i++) {
            System.out.println("Enter the number of  columns for row " + (i + 1));
            int columns = sohaib.nextInt();
            if (columns > max) {
                max = columns;
            }
            arr[i] = new int[columns];

            for (int j = 0; j < columns; j++) {
                arr[i][j] = sohaib.nextInt();
            }
        }
        int countcolumn = 0;
        int maxcolumn = -1;
        for (int k = 0; k < max; k++) {
            int count = 0;

            for (int i = 0; i < rows; i++) {
                int columns = arr[i].length;
                for (int j = 0; j < columns; j++) {
                    if (j == k) {
                        if (isprime(arr[i][j])) {
                            count++;

                        }
                    }
                }

                if (maxcolumn < count) {
                    count = max;
                    maxcolumn = k;
                }
            }
        }
        int n = 0;
        int countrow = 0;
        int maxrow = -1;
        int count = 0;
        for (int i = 0; i < rows; i++) {
            int columns = arr[i].length;
            for (int j = 0; j < columns; j++) {
                if (i == n) {
                    if (isprime(arr[i][j])) {
                        count++;

                    }
                }
            }
            if (max < count) {
                countrow = max;
                maxrow = n;

            }
            n++;
        }
        if (countcolumn < countrow) {
            System.out.println("the column contain maximium number of prime number is " + maxcolumn + " and has" + countrow + " primes"); 
        }else {
            System.out.println("the column contain maximium number of prime number is " + countcolumn + " and has" + countcolumn + " primes");
        }

    }

    public static boolean isprime(int i) {
        if (i < 2) {
            return false;
        }
        int j = 2;
        while (j <= Math.sqrt(i)) {
            if (i % j == 0) {
                return false;
            }
            j++;
        }
        return true;
    }
}
