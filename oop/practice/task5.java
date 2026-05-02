public class task5{
    public static void check(int [] arr , int target){
        int start = 0 ;
        int end = 1 ;
        double n = 2;
        while (target> arr[end]){
            start = end +1;
            end = start + (int)(Math.pow(2,n));

        }
    System.out.println(binarySearch(arr, start, end , target));}
        public static int binarySearch(int arr[], int low, int high, int x)
{
    while (low <= high) {
        int mid = low + (high - low) / 2;

        // Check if x is present at mid
        if (arr[mid] == x)
            return mid;

        // If x greater, ignore left half
        if (arr[mid] < x)
            low = mid + 1;

        // If x is smaller, ignore right half
        else
            high = mid - 1;
    }

    // If we reach here, then element was not present
    return -1;
}
        
    
    public static void main(String[] args) {
        int[] arr = {1,2,3,4,5,6,98,800};
        int target = 4;
        check(arr, target);

    }
}