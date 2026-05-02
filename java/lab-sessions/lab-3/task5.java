import java.util.Scanner;
public class task5 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the total amount of milk produced in the morning ");
        float milk = sohaib.nextFloat() ;
        int milkCartons = Math.round(milk/3.78f);
        float Cost = milk * 0.38f;
        float profit = milk * 0.27f;
        System.out.println("The milkcartoons  are " +milkCartons);
        System.out.println("The cost is " +Cost);
        System.out.println("The profit is " +profit);

    }
}