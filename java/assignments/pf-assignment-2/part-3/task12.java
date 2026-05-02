public class task12 {
    public static void main(String[] args) {
        binary(23);
    }
    public static void binary (int number){
        if (number==1){
            System.out.print(1);
            return ;
        }
        if (number%2==0){
            binary(number/2);
            System.out.print(0);
            return;
        }
        if  (number%2!=0){
            binary((number-1)/2);
            System.out.print(1);
        }
    }
}
