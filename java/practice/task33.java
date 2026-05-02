public  class task33{
    public static void main (String [] args){
        int i = 0;
        while (i<13){
            System.out.print("*");
            i++;
        }
        System.out.println("");
        for (int j = 0; j < 4; j++){
            for (int k = 0; k < 4-j; k++) {
                if (j==3){
                    System.out.print("*  M Sohaib *");
                    continue;
                }
                System.out.print("*");
            }
            for (int l = 0; l < 5 + 2*j; l++) {
                    System.out.print(" ");
            }
            for (int k = 0; k < 4-j; k++) {
                if (j==3){
                    continue;
                }
                System.out.print("*");    
            }
            System.out.println();
            
            }
        for (int j = 1; j < 4; j++){
            for (int k = 0; k <= j; k++) {
                System.out.print("*");       
            }
            for (int l = 0; l < 11 - 2*j; l++) {
                System.out.print(" ");
            }
            for (int k = 0; k <= j; k++) {
                System.out.print("*");
            }
            System.out.println();
                
                }

        }

    }
