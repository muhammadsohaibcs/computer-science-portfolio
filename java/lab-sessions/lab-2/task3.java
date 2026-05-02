public class task3 {
    public static void main(String[] args) {
        int[] arr = new int [] {1,2,3,4};
        int [] arr1 = arr.clone();
        for (int i = arr1.length-1; i > -1; i--) {
            System.out.println(arr1[i]);
        }
    }
}
