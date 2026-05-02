import java.util.Scanner;
public class Task4 {
    public static Scanner sohaib = new Scanner(System.in);
    public static String[][] Array = new String[100][4];
    public static int j = 0;
    public static void main(String[] args) {
        mainMenu();                       
    }
    public static void mainMenu(){
        System.out.println("Main Window:\n============= \nChoose one of the following options: \n(1) Add a new contact\n(2) Search for contact \n(3) Display all contacts\n(4) Quit\nEnter your choice:");
        int choice =sohaib.nextInt();
        sohaib.nextLine();
        while (!(choice ==1 ||choice ==2||choice ==3 ||choice ==4)){
            System.out.println("You have entered an Invalid input\nEnter it again: ");
                choice = sohaib.nextInt();
                sohaib.nextLine();
        }
            if (choice==1)
                add();
            else if (choice==2)
                search();
            else if (choice==3)
                display();
            else if (choice==4)
                System.out.println("Have a nice day ahead. Bye... ");
    }
    public static void add(){
        System.out.println("Main Window --> Add a new contact Window: (Enter the following information)\n=========================================================================== ");
        System.out.print("Name : ");
        Array[j][0] = sohaib.nextLine(); 
        System.out.print("Email : ");
        Array[j][1] = sohaib.nextLine();
        System.out.print("Phone : ");
        Array[j][2] = sohaib.nextLine();
        System.out.print("Notes : ");
        Array[j][3] = sohaib.nextLine();
        j++;
        
        System.out.println("---------------------------------------------------------------------------- \nSaved successfully... Press Enter to go back to the Main Window");
        sohaib.nextLine();
        mainMenu();     
    }
    public static void search(){
        System.out.print("Main Window --> Search for Contact Window: (Choose one of the following options) \n================================================================================ \n(1) Search by Name \n(2) Search by Email \n(3) Search by Phone \nEnter your choice:");
        int choice = sohaib.nextInt();
        sohaib.nextLine();
        while (!(choice ==1 ||choice ==2||choice ==3)){
            System.out.println("You have entered an Invalid input\nEnter it again: ");
                choice = sohaib.nextInt();
                sohaib.nextLine();
        }
            if (choice==1)
                searchName();
            else if (choice==2)
                searchEmail();
            else if (choice==3)
                searchPhone();
    }
    public static void searchName(){
        System.out.println("Main Window --> Search for Contact Window --> Search by Name \n============================================================= \n(1) Enter Name:");
        String name = sohaib.nextLine();
        System.out.println("Search Results: \n------------------------------------------------------------------------------------- ");
        System.out.printf("%-2s  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", "ID","NAME","EMAIL","PHONE","NOTES");
        System.out.println("------------------------------------------------------------------------------------- ");
        for (int i = 0; i < Array.length; i++) {
            if (Array[i][0] == null){
                break;
            }
            if (Array[i][0].equals(name)){
                System.out.printf("%-2d  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", i+1,Array[i][0],Array[i][1],Array[i][2],Array[i][3]);
                System.out.println("------------------------------------------------------------------------------------- ");
            }      
        }
        System.out.printf("%40s\n","End of List");
        menu2();
    }
    public static void menu2(){
        System.out.println("Choose one of these options:  \n(1) To delete a contact\n(2) Back to main Window \nEnter your choice:");
                int choice = sohaib.nextInt();
                sohaib.nextLine();
                while (!(choice ==1 ||choice ==2)){
                    System.out.println("You have entered an Invalid input\nEnter it again: ");
                        choice = sohaib.nextInt();
                        sohaib.nextLine();
                }
                    if (choice==1)
                        System.out.println("This option will be available soon");
                        mainMenu();
                    if (choice==2)
                        mainMenu();
    }
    // public static void delete(){
    //     System.out.println("Main Window --> Search for Contact Window --> Search by Name --> Delete a Contact \n================================================================================= \n(1) Enter the Contact ID:");
    //     int choice =sohaib.nextInt();
    //     sohaib.nextLine();
    //     while (choice>Array.length){
    //         System.out.println("You have entered an Invalid input\nEnter it again: ");
    //             choice = sohaib.nextInt();
    //             sohaib.nextLine();
    //     }
    //     Array.remove(choice-1);
    //     System.out.println("Deleted... Press Enter to go back to the Main Window");
    //     sohaib.nextLine();
    //     mainMenu();
    // }
    public static void searchEmail(){
        System.out.println("Main Window --> Search for Contact Window --> Search by Email \n============================================================= \n(1) Enter Email:");
        String email = sohaib.nextLine();
        System.out.println("Search Results: \n------------------------------------------------------------------------------------- ");
        System.out.printf("%-2s  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", "ID","NAME","EMAIL","PHONE","NOTES");
        System.out.println("------------------------------------------------------------------------------------- ");
        for (int i = 0; i < Array.length; i++) {
            if (Array[i][0] == null){
                break;
            }
            if (Array[i][1].equals(email)){
                System.out.printf("%-2d  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", i+1,Array[i][0],Array[i][1],Array[i][2],Array[i][3]);
                System.out.println("------------------------------------------------------------------------------------- ");
            }        
        }
        System.out.printf("%40s\n","End of List");
        menu2();
    }
    public static void searchPhone(){
        System.out.println("Main Window --> Search for Contact Window --> Search by Phone \n============================================================= \n(1) Enter Phone:");
        String phone = sohaib.nextLine();
        System.out.println("Search Results: \n------------------------------------------------------------------------------------- ");
        System.out.printf("%-2s  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", "ID","NAME","EMAIL","PHONE","NOTES");
        System.out.println("------------------------------------------------------------------------------------- ");
        for (int i = 0; i < Array.length; i++) {
            if (Array[i][0] == null){
                break;
            }
            if (Array[i][1].equals(phone)){
                System.out.printf("%-2d  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", i+1,Array[i][0],Array[i][1],Array[i][2],Array[i][3]);
                System.out.println("------------------------------------------------------------------------------------- ");
            }        
        }
        System.out.printf("%40s\n","End of List");
        menu2();
    }
    public static void display(){
        System.out.println("Main Window --> Display All Contacts \n===================================== ");
        System.out.println("------------------------------------------------------------------------------------- ");
        System.out.printf("%-2s  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", "ID","NAME","EMAIL","PHONE","NOTES");
        System.out.println("------------------------------------------------------------------------------------- ");
        for (int i = 0; i < Array.length; i++) {
            if (Array[i][0] == null){
                break;
            }
                System.out.printf("%-2d  |  %-20s  |  %-20s  |  %-20s  |  %-20s  \n", i+1,Array[i][0],Array[i][1],Array[i][2],Array[i][3]);
                System.out.println("------------------------------------------------------------------------------------- ");
        }
        System.out.printf("%40s\n","End of List");
        System.out.println("Press Enter to go back to the Main Window");
        sohaib.nextLine();
        mainMenu();
    }
}