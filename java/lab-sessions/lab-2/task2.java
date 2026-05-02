

public class task2 {
    
    public static void main(String[] args) {
        int [] elements = new int[] {1,2,2,2,2,2,2,2,2,2};
        modify(elements);
        for (int idx = 0; idx < elements.length; idx++) {
            System.out.println(elements[idx]);
            
        }


    }
    public static int [] modify (int[] elements){
        for (int i = 0; i < 10; i++) {
            elements[i] *= 3;
            
        }
        return elements;

    }
}
