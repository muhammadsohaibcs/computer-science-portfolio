
import java.io.EOFException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.Scanner;



class Book implements Serializable{
    String name;
    String publisher;
    Person author;
    public Book(String name, String publisher, Person author) {
        this.name = name;
        this.publisher = publisher;
        this.author = author;
    }

    public Person getAuthor() {
        return author;
    }
    public String getName() {
        return name;
    }public String getPublisher() {
        return publisher;
    }public void setAuthor(Person author) {
        this.author = author;
    }public void setPublisher(String publisher) {
        this.publisher = publisher;
    }public void setName(String name) {
        this.name = name;
    }

   @Override
   public String toString() {
       return "The book name is " + name + " , the book publisher name is " + publisher + author;
   }
    
}
class Person implements Serializable{
    String name;
    int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public int getAge() {
        return age;
    }
    public String getName() {
        return name;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public void setName(String name) {
        this.name = name;
    }
    @Override
    public String toString() {
        return " ,the author name is " + name + " and his age is " + age ;
    }
}
public class Task1 {
    public static void main(String[] args) {
        try {
            ObjectOutputStream fout = new ObjectOutputStream(new FileOutputStream("BookStore.ser"));
            Person p1 = new Person("Sohaib", 12);
            for (int i = 0; i < 5; i++) {
                Book b1 = new Book("A" + i, "B" + i, p1);
                fout.writeObject(b1);
            }
            fout.close();
            System.out.println("All Books in Store:");
            ObjectInputStream fin = new ObjectInputStream(new FileInputStream("BookStore.ser"));
            Book[] books = new Book[5];
            int count = 0;
            try {
                while (true) {
                    Book b = (Book) fin.readObject();
                    books[count++] = b;
                    System.out.println(b);
                }
            } catch (EOFException e) {
                fin.close();
            }
            Scanner sohaib= new Scanner(System.in);
            System.out.print("\nEnter book name to search: ");
            String search = sohaib.nextLine();
            boolean found = false;

            for (Book b : books) {
                if (b != null && b.name.equalsIgnoreCase(search)) {
                    System.out.println("Book Found: " + b);
                    found = true;
                }
            }

            if (!found) {
                System.out.println("Book not found.");
            }

        } catch (Exception e) {
            System.out.println(e);
        }
    }
}