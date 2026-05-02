import java.util.Scanner;

public class labtask1 {
    public static void main(String[] args) {
        final double EARTH_RADIUS = 6371.01;
        Scanner sohaib = new Scanner(System.in);
        System.out.print("Enter point 1 (latitude and longitude) in degrees: ");
        double x1 = sohaib.nextDouble();
        double y1 = sohaib.nextDouble();
        System.out.print("Enter point 2 (latitude and longitude) in degrees: ");
        double x2 = sohaib.nextDouble();
        double y2 = sohaib.nextDouble();
        x1 = Math.toRadians(x1);
        y1 = Math.toRadians(y1);
        x2 = Math.toRadians(x2);
        y2 = Math.toRadians(y2);
        double distance = EARTH_RADIUS * Math.acos(Math.sin(x1) * Math.sin(x2) +Math.cos(x1) * Math.cos(x2) * Math.cos(y1 - y2));
        System.out.printf("The distance between the two points is %.15f km%n", distance);
    }
}



