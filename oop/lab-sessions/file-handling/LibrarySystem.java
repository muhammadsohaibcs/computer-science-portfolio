import java.io.*;
import java.util.Scanner;

class Book implements Serializable {
    int bookID;
    String bookName;
    String status; 

    public Book(int bookID, String bookName) {
        this.bookID = bookID;
        this.bookName = bookName;
        this.status = "Available";
    }

    public String toString() {
        return "Book ID: " + bookID + ", Name: " + bookName + ", Status: " + status;
    }
}
public class LibrarySystem {
    static final String FILE_NAME = "LibraryBooks.ser";
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int choice;

        do {
            System.out.println("\n******************** Library Management Menu ********************");
            System.out.println("1. Add New Book");
            System.out.println("2. Borrow Book");
            System.out.println("3. Delete Book");
            System.out.println("4. Display All Books");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch (choice) {
                case 1:
                    addBook();
                    break;
                case 2:
                    borrowBook();
                    break;
                case 3:
                    deleteBook();
                    break;
                case 4:
                    displayBooks();
                    break;
                case 5:
                    System.out.println("Exiting...");
                    break;
                default:
                    System.out.println("Invalid choice.");
            }
        } while (choice != 5);
    }
    public static void addBook() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter Book ID: ");
        int id = sc.nextInt();
        sc.nextLine(); 
        System.out.print("Enter Book Name: ");
        String name = sc.nextLine();

        Book newBook = new Book(id, name);

        Book[] books = readBooks();
        Book[] updatedBooks = new Book[books.length + 1];

        for (int i = 0; i < books.length; i++) {
            updatedBooks[i] = books[i];
        }
        updatedBooks[books.length] = newBook;

        writeBooks(updatedBooks);

        System.out.println("Book added successfully.");
    }
    public static void borrowBook() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter Book ID to borrow: ");
        int id = sc.nextInt();

        Book[] books = readBooks();
        boolean found = false;

        for (int i = 0; i < books.length; i++) {
            if (books[i].bookID == id && books[i].status.equals("Available")) {
                books[i].status = "Borrowed";
                found = true;
                break;
            }
        }

        if (found) {
            writeBooks(books);
            System.out.println("Book borrowed successfully.");
        } else {
            System.out.println("Book not found or already borrowed.");
        }
    }
    public static void deleteBook() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter Book ID to delete: ");
        int id = sc.nextInt();

        Book[] books = readBooks();
        int count = 0;
        for (int i = 0; i < books.length; i++) {
            if (books[i].bookID != id) {
                count++;
            }
        }

        if (count == books.length) {
            System.out.println("Book not found.");
            return;
        }

        Book[] updatedBooks = new Book[count];
        int index = 0;

        for (int i = 0; i < books.length; i++) {
            if (books[i].bookID != id) {
                updatedBooks[index++] = books[i];
            }
        }

        writeBooks(updatedBooks);
        System.out.println("Book deleted successfully.");
    }
    public static void displayBooks() {
        Book[] books = readBooks();

        if (books.length == 0) {
            System.out.println("No books available.");
        } else {
            System.out.println("--- Book List ---");
            for (int i = 0; i < books.length; i++) {
                System.out.println(books[i]);
            }
        }
    }
    public static Book[] readBooks() {
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(FILE_NAME))) {
            return (Book[]) in.readObject();
        } catch (Exception e) {
            return new Book[0]; 
        }
    }
    public static void writeBooks(Book[] books) {
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            out.writeObject(books);
        } catch (IOException e) {
            System.out.println("Error writing to file.");
        }
    }
}


