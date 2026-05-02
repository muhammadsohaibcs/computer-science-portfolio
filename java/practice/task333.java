public  class task333{
    public static void main (String [] args){
        for (int j = 4; j > -1; j--){
            for (int k = 0; k < 5-j; k++) {
                System.out.print("*");
            }
            for (int l = 0; l < 2*j ; l++) {
                    System.out.print(" ");
            }
            for (int k = 0; k < 5-j; k++) {
                System.out.print("*");    
            }
            System.out.println();
            
            }
        for (int j = 0; j < 4; j++){
            for (int k = 0; k < 4-j; k++) {
                System.out.print("*");       
            }
            for (int l = 0; l < 2*(j+1); l++) {
                System.out.print(" ");
            }
            for (int k = 0; k < 4-j; k++) {
                System.out.print("*");       
            }
            System.out.println();
                
                }

        }

    }
