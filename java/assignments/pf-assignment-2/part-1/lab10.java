import java.util.Scanner;

public class lab10 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        int year = sohaib.nextInt();
        int day = sohaib.nextInt();
        int month = 1;
        while (month <= 12) {
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                if (month == 1) {
                    System.out.printf("%30s", "January " + year);
                }
                if (month == 3) {
                    System.out.printf("%30s", "March " + year);
                }
                if (month == 5) {
                    System.out.printf("%30s", "May " + year);
                }
                if (month == 7) {
                    System.out.printf("%30s", "July " + year);
                }
                if (month == 8) {
                    System.out.printf("%30s", "August " + year);
                }
                if (month == 10) {
                    System.out.printf("%30s", "October " + year);
                }
                if (month == 12) {
                    System.out.printf("%30s", "December " + year);
                }
                System.out.println();
                System.out.println("__________________________________________________");
                System.out.printf("%7s%7s%7s%7s%7s%7s%7s", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat");
                System.out.println();
                for (int i = 0; i < day; i++)
                    System.out.printf("%7s", " ");
                for (int j = 1; j <= 31; j++) {
                    int line = day + j;
                    if (line == 7 || line == 14 || line == 21 || line == 28 || line == 35) {
                        System.out.printf("%7d\n", j);
                    } else
                        System.out.printf("%7d", j);
                }
                System.out.println();
                day = day + 3;
                while (day>=7) {
                    day-=7;
                    if (day <7)
                    break;
                }
            }
            if (month == 2) {
                System.out.printf("%30s", "Feburary " + year);
                System.out.println();
                System.out.println("____________________________________________");
                System.out.printf("%7s%7s%7s%7s%7s%7s%7s", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat");
                System.out.println();
                for (int i = 0; i < day; i++)
                    System.out.printf("%7s", " ");
                for (int j = 1; j <= 28; j++) {
                    int line = day + j;
                    if (line == 7 || line == 14 || line == 21 || line == 28 || line == 35) {
                        System.out.printf("%7d\n", j);
                    } else
                        System.out.printf("%7d", j);
                }
                System.out.println();
            }
            if (month == 4 || month == 6 || month == 9 || month == 11) {
                if (month == 4) {
                    System.out.printf("%30s", "April" + year);
                }
                if (month == 6) {
                    System.out.printf("%30s", "June" + year);
                }
                if (month == 9) {
                    System.out.printf("%30s", "September" + year);
                }
                if (month == 11) {
                    System.out.printf("%30s", "November " + year);
                }
                System.out.println();
                System.out.println("________________________________________________");
                System.out.printf("%7s%7s%7s%7s%7s%7s%7s", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat");
                System.out.println();
                for (int i = 0; i < day; i++)
                    System.out.printf("%7s", " ");
                for (int j = 1; j <= 30; j++) {
                    int line = day + j;
                    if (line == 7 || line == 14 || line == 21 || line == 28 || line == 35) {
                        System.out.printf("%7d\n", j);
                    } else
                        System.out.printf("%7d", j);
                }
                System.out.println();
                day = day + 2;
                while (day>=7) {
                    day-=7;
                    if (day <7)
                        break;
                }
            }
            month++;
           
        }

    }
}
