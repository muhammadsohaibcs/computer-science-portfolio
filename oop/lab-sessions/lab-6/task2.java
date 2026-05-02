import java.util.Scanner;
class Publication{
    String title;
    double price;

    public Publication() {
    }

    public Publication(String title, double price) {
        this.title = title;
        this.price = price;
    }

    public double getPrice() {
        return price;
    }

    public String getTitle() {
        return title;
    }

    public void setPrice(double price) {
        this.price = price;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public void display(){
        System.out.println("The title is " + title);
        System.out.println("The price is " + price);
    }
    
}
class Book extends Publication{
    int pagecount;

    public Book() {
    }

    public Book(int pagecount) {
        this.pagecount = pagecount;
    }

    public Book(int pagecount, String title, double price) {
        super(title, price);
        this.pagecount = pagecount;
    }

    public int getPagecount() {
        return pagecount;
    }

    public void setPagecount(int pagecount) {
        this.pagecount = pagecount;
    }


    public void display() {
        super.display();
        System.out.println("the page count is " + pagecount);

    } 
}
class Tape extends Publication{
    int time;

    public Tape() {
    }

    public Tape(int time) {
        this.time = time;
    }

    public Tape(int time, String title, double price) {
        super(title, price);
        this.time = time;
    }

    public int getTime() {
        return time;
    }
    public void setTime(int time) {
        this.time = time;
    }
    public void display() {
        super.display();
        System.out.println("the time duration in minutes is" + time);

    } 

}



public class task2 {
    public static void main(String[] args) {
        Scanner sohaib = new Scanner(System.in);
        System.out.println("Enter the number of pages");
        int a = sohaib.nextInt();
        System.out.println("Enter the title of Book");
        String b = sohaib.next();
        System.out.println("Enter the price of pages");
        int c = sohaib.nextInt();
        Book d = new Book(a, b, c);
        d.display();
        System.out.println("*************************************************");
        System.out.println("Enter the duration  of Audio");
        int e = sohaib.nextInt();
        System.out.println("Enter the title of Audio");
        String f = sohaib.next();
        System.out.println("Enter the price of pages");
        int g = sohaib.nextInt();
        Tape h = new Tape(a, b, c);
        h.display();
        System.out.println("*************************************************");
        
        
    }
}
