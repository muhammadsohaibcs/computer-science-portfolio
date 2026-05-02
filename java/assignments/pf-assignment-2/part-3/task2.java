public class task2 {
    public static void main(String[] args) {
        displaySortedNumbers(7, 10, 2);
    }
    public static void displaySortedNumbers(double num1, double num2, double num3){
        double numMax = Math.max(num1, Math.max(num2, num3));
        double numMin = Math.min(num1, Math.min(num2, num3));
        System.out.println(numMin);
        if ((numMin==num1|| numMin==num3)&& (numMax==num1|| numMax==num3))
            System.out.println(num2);
        else if ((numMin==num2|| numMin==num3)&& (numMax==num2|| numMax==num3))
            System.out.println(num1);
        else if ((numMin==num1|| numMin==num2)&& (numMax==num1|| numMax==num2))
            System.out.println(num3);
        System.out.println(numMax);
    }
}
