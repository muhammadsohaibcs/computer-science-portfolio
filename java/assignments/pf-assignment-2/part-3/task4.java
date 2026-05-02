package PF2 Assignment.Part3;

public class task4 {
    public static void main(String[] args) {
        for (int i = 2000; i < 2021; i++) {
            System.out.println(i +" " +numberOfDaysInAYear(i));
        }
        
    }
    public static int numberOfDaysInAYear(int year){
        if ((year%4==0 && year%100!=0) || year%400==0 ){
            return 366;
        }
        return 365;
    }
}
