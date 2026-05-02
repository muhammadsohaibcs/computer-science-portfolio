import java.util.Scanner;
public class task6 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner (System.in);
        System.out.println("Enter the pay rate for an hour");
        float pay = sohaib.nextFloat();
        System.out.println("Enter number of hours each  week");
        float hours = sohaib.nextFloat();
        float incomeB = pay* hours*5;
        float incomeA = incomeB*0.86f;
        System.out.println("Income before tax : " + pay* hours*5);
        System.out.println("Income after tax : " + incomeA);
        System.out.println( "Cloths = " + incomeA*.10);
        System.out.println("School Supplies = "+ 0.01f* incomeA);
        float remaining = incomeA * 0.75f;
        float savingBonds = remaining * 0.25f;
        System.out.println("Saving bonds amount = " + savingBonds);
        savingBonds = (int) savingBonds;
        float parrentBonds = savingBonds /2;
        System.out.println("parrents Bonds = "+ parrentBonds);


        System.out.println();

    }
}
