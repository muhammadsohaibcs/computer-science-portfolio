public class task5 {
    public static void main(String[] args) {
        int x = 10, y = 5, z =10;
        if (x == y && x ==z )
            System.out.println("3");
        else if (x == y || x ==z || y==z)
            System.out.println("2");
        else
            System.out.println("0");
    }
}
