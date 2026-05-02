import java.time.LocalDate;
import java.util.*;

interface Loanable {
    void checkOut(Patron patron, LocalDate date);
    void checkIn();
    boolean isOverdue(LocalDate currentDate);
    void renew(LocalDate currentDate);
}

interface FineCalculatable {
    double calculateFine(LocalDate currentDate);
    double getFineRate();
    double getMaxFine();
}

interface Searchable {
    boolean searchByTitle(String title);
    boolean searchByAuthor(String author);
    boolean filterByAvailability();
}

interface Reportable {
    void generateOverdueReport(LocalDate currentDate);
    void generatePopularItemsReport();
    void generateUsageStatistics();
}

abstract class Material implements Loanable, FineCalculatable, Searchable {
    protected String id, title, author, language, genre;
    protected int publicationYear;
    protected boolean isAvailable;

    public Material(String id, String title, String author, int publicationYear, String language, String genre) {
        this.id = id ;
        this.title = title ;
        this.author = author ;
        this.publicationYear = publicationYear < 0 ? 0 : publicationYear;
        this.language = language ;
        this.genre = genre ;
        this.isAvailable = true;
    }

    @Override
    public boolean searchByTitle(String title) {
         return this.title.toLowerCase().contains(title.toLowerCase()); 
    }
    @Override
    public boolean searchByAuthor(String author) { 
        return this.author.toLowerCase().contains(author.toLowerCase());
    }
    @Override
    public boolean filterByAvailability() {
         return isAvailable; 
    }
}

class Book extends Material {
    private String isbn, publisher, edition;

    public Book(String id, String title, String author, int publicationYear, String language, String genre, String isbn, String publisher, String edition) {
        super(id, title, author, publicationYear, language, genre);
        this.isbn = isbn ;
        this.publisher = publisher ;
        this.edition = edition;
    }

    @Override
    public void checkOut(Patron patron, LocalDate date) {
        if (isAvailable && patron.canBorrow(this)) {
            isAvailable = false;
            patron.borrow(this, date.plusDays(patron.getLoanPeriod()));
        }
    }

    @Override
    public void checkIn() { isAvailable = true; }

    @Override
    public boolean isOverdue(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                return currentDate.isAfter(loan.dueDate);
            }
        }
        return false;
    }

    @Override
    public void renew(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                loan.dueDate = currentDate.plusDays(loan.patron.getLoanPeriod());
                break;
            }
        }
    }

    @Override
    public double calculateFine(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && isOverdue(currentDate)) {
                long daysLate = currentDate.toEpochDay() - loan.dueDate.toEpochDay();
                if (daysLate < 0) daysLate = 0;
                double fine = daysLate * getFineRate() * loan.patron.getFineMultiplier();
                return fine > getMaxFine() ? getMaxFine() : fine;
            }
        }
        return 0.0;
    }

    @Override
    public double getFineRate() { return 0.25; }
    @Override
    public double getMaxFine() { return 10.0; }
}

class EBook extends Material {
    private String downloadLink;
    private String compatibleDevices;

    public EBook(String id, String title, String author, int publicationYear, String language, String genre, String downloadLink, String compatibleDevices) {
        super(id, title, author, publicationYear, language, genre);
        this.downloadLink = downloadLink ;
        this.compatibleDevices = compatibleDevices ;
    }

    @Override
    public void checkOut(Patron patron, LocalDate date) {
        if (isAvailable && patron.canBorrow(this)) {
            isAvailable = false;
            patron.borrow(this, date.plusDays(patron.getLoanPeriod()));
        }
    }

    @Override
    public void checkIn() { isAvailable = true; }

    @Override
    public boolean isOverdue(LocalDate currentDate) { return false; } 

    @Override
    public void renew(LocalDate currentDate) {} 

    @Override
    public double calculateFine(LocalDate currentDate) { return 0.0; } 

    @Override
    public double getFineRate() { return 0.0; }
    @Override
    public double getMaxFine() { return 0.0; }
}

class Audiobook extends Material {
    private String narrator;
    private double playbackLength;

    public Audiobook(String id, String title, String author, int publicationYear, String language, String genre, String narrator, double playbackLength) {
        super(id, title, author, publicationYear, language, genre);
        this.narrator = narrator;
        this.playbackLength = playbackLength < 0 ? 0 : playbackLength;
    }

    @Override
    public void checkOut(Patron patron, LocalDate date) {
        if (isAvailable && patron.canBorrow(this)) {
            isAvailable = false;
            patron.borrow(this, date.plusDays(patron.getLoanPeriod()));
        }
    }

    @Override
    public void checkIn() { isAvailable = true; }

    @Override
    public boolean isOverdue(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                return currentDate.isAfter(loan.dueDate);
            }
        }
        return false;
    }

    @Override
    public void renew(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                loan.dueDate = currentDate.plusDays(loan.patron.getLoanPeriod());
                break;
            }
        }
    }

    @Override
    public double calculateFine(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && isOverdue(currentDate)) {
                long daysLate = currentDate.toEpochDay() - loan.dueDate.toEpochDay();
                if (daysLate < 0) daysLate = 0;
                double fine = daysLate * getFineRate() * loan.patron.getFineMultiplier();
                return fine > getMaxFine() ? getMaxFine() : fine;
            }
        }
        return 0.0;
    }

    @Override
    public double getFineRate() { return 0.50; }
    @Override
    public double getMaxFine() { return 15.0; }
}

class DVD extends Material {
    private String director, actors, subtitles;
    private double runtime;

    public DVD(String id, String title, String author, int publicationYear, String language, String genre, String director, String actors, double runtime, String subtitles) {
        super(id, title, author, publicationYear, language, genre);
        this.director = director;
        this.actors = actors ;
        this.runtime = runtime < 0 ? 0 : runtime;
        this.subtitles = subtitles;
    }

    @Override
    public void checkOut(Patron patron, LocalDate date) {
        if (isAvailable && patron.canBorrow(this)) {
            isAvailable = false;
            patron.borrow(this, date.plusDays(patron.getLoanPeriod()));
        }
    }

    @Override
    public void checkIn() { isAvailable = true; }

    @Override
    public boolean isOverdue(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                return currentDate.isAfter(loan.dueDate);
            }
        }
        return false;
    }

    @Override
    public void renew(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && !isAvailable) {
                loan.dueDate = currentDate.plusDays(loan.patron.getLoanPeriod());
                break;
            }
        }
    }

    @Override
    public double calculateFine(LocalDate currentDate) {
        for (Loan loan : Library.loans) {
            if (loan.material == this && isOverdue(currentDate)) {
                long daysLate = currentDate.toEpochDay() - loan.dueDate.toEpochDay();
                if (daysLate < 0) daysLate = 0;
                double fine = daysLate * getFineRate() * loan.patron.getFineMultiplier();
                return fine > getMaxFine() ? getMaxFine() : fine;
            }
        }
        return 0.0;
    }

    @Override
    public double getFineRate() { return 1.00; }
    @Override
    public double getMaxFine() { return 20.0; }
}

abstract class Patron {
    protected String id, name;
    protected double fines;
    protected ArrayList<Loan> loans = new ArrayList<>();

    public Patron(String id, String name) {
        this.id = id ;
        this.name = name ;
        this.fines = 0;
    }

    public abstract int getMaxItems();
    public abstract int getLoanPeriod();
    public abstract double getFineMultiplier();
    public abstract boolean canBorrow(Material material);

    public void borrow(Material material, LocalDate dueDate) {
        loans.add(new Loan(this, material, dueDate));
    }

    public double getFines() { return fines; }
    public String getName() { return name; }
}

class Student extends Patron {
    public Student(String id, String name) { super(id, name); }

    @Override
    public int getMaxItems() { return 10; }
    @Override
    public int getLoanPeriod() { return 21; }
    @Override
    public double getFineMultiplier() { return 1.0; }
    @Override
    public boolean canBorrow(Material material) { return loans.size() < getMaxItems() && fines < 50.0; }
}

class Faculty extends Patron {
    public Faculty(String id, String name) { super(id, name); }

    @Override
    public int getMaxItems() { return 20; }
    @Override
    public int getLoanPeriod() { return 42; }
    @Override
    public double getFineMultiplier() { return 0.5; }
    @Override
    public boolean canBorrow(Material material) { return loans.size() < getMaxItems() && fines < 50.0; }
}

class SeniorCitizen extends Patron {
    public SeniorCitizen(String id, String name) { super(id, name); }

    @Override
    public int getMaxItems() { return 15; }
    @Override
    public int getLoanPeriod() { return 21; }
    @Override
    public double getFineMultiplier() { return 0.5; }
    @Override
    public boolean canBorrow(Material material) {
         return loans.size() < getMaxItems() && fines < 50;
    }
}

class Child extends Patron {
    public Child(String id, String name) { super(id, name); }

    @Override
    public int getMaxItems() { return 5; }
    @Override
    public int getLoanPeriod() { return 14; }
    @Override
    public double getFineMultiplier() { return 0; }
    @Override
    public boolean canBorrow(Material material) { 
        return loans.size() < getMaxItems() && material.genre.equalsIgnoreCase("Children");
    }
}

class Loan {
    Patron patron;
    Material material;
    LocalDate dueDate;

    public Loan(Patron patron, Material material, LocalDate dueDate) {
        this.patron = patron;
        this.material = material;
        this.dueDate = dueDate ;
    }
}

class Reservation {
    Patron patron;
    Material material;
    LocalDate reservationDate;

    public Reservation(Patron patron, Material material, LocalDate reservationDate) {
        this.patron = patron;
        this.material = material;
        this.reservationDate = reservationDate ;
    }
}

class Library  {
    static ArrayList<Material> materials = new ArrayList<>();
    static ArrayList<Patron> patrons = new ArrayList<>();
    static ArrayList<Loan> loans = new ArrayList<>();
    static ArrayList<Reservation> reservations = new ArrayList<>();
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        LocalDate currentDate = LocalDate.now();
        while (true) {
            System.out.println("\nLibrary Management System");
            System.out.println("1. Add Material");
            System.out.println("2. Add Patron");
            System.out.println("3. Checkout Item");
            System.out.println("4. Return Item");
            System.out.println("5. Calculate Fines");
            System.out.println("6. Search Materials");
            System.out.println("7. Place Reservation");
            System.out.println("8. Generate Reports");
            System.out.println("9. Exit");
            System.out.print("Choose: ");

            int choice = scanner.nextInt();
            scanner.nextLine();
            if (choice < 1 || choice > 9) {
                System.out.println("Invalid option.");
                continue;
            }
            if (choice == 9) {
                System.out.println("Exiting...");
                break;
            }

            switch (choice) {
                case 1: addMaterial(); break;
                case 2: addPatron(); break;
                case 3: checkoutItem(currentDate); break;
                case 4: returnItem(currentDate); break;
                case 5: calculateFines(currentDate); break;
                case 6: searchMaterials(); break;
                case 7: placeReservation(currentDate); break;
                case 8: generateReports(currentDate); break;
            }
        }
        scanner.close();
    }

    private static void addMaterial() {
        System.out.println("Type: 1. Book 2. EBook 3. Audiobook 4. DVD");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type < 1 || type > 4) {
            System.out.println("Invalid type.");
            return;
        }
        System.out.print("ID: ");
        String id = scanner.nextLine();
        System.out.print("Title: ");
        String title = scanner.nextLine();
        System.out.print("Author: ");
        String author = scanner.nextLine();
        System.out.print("Publication year: ");
        int year = scanner.nextInt();
        scanner.nextLine();
        System.out.print("Language: ");
        String language = scanner.nextLine();
        System.out.print("Genre: ");
        String genre = scanner.nextLine();
        Material material;
        if (type == 1) {
            System.out.print("ISBN: ");
            String isbn = scanner.nextLine();
            System.out.print("Publisher: ");
            String publisher = scanner.nextLine();
            System.out.print("Edition: ");
            String edition = scanner.nextLine();
            material = new Book(id, title, author, year, language, genre, isbn, publisher, edition);
        } else if (type == 2) {
            System.out.print("Download link: ");
            String link = scanner.nextLine();
            System.out.print("Compatible devices: ");
            String devices = scanner.nextLine();
            material = new EBook(id, title, author, year, language, genre, link, devices);
        } else if (type == 3) {
            System.out.print("Narrator: ");
            String narrator = scanner.nextLine();
            System.out.print("Playback length (hours): ");
            double length = scanner.nextDouble();
            scanner.nextLine();
            material = new Audiobook(id, title, author, year, language, genre, narrator, length);
        } else {
            System.out.print("Director: ");
            String director = scanner.nextLine();
            System.out.print("Actors: ");
            String actors = scanner.nextLine();
            System.out.print("Runtime (hours): ");
            double runtime = scanner.nextDouble();
            scanner.nextLine();
            System.out.print("Subtitles: ");
            String subtitles = scanner.nextLine();
            material = new DVD(id, title, author, year, language, genre, director, actors, runtime, subtitles);
        }
        materials.add(material);
        System.out.println("Material added: " + title);
    }

    private static void addPatron() {
        System.out.println("Type: 1. Student 2. Faculty 3. Senior 4. Child");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type < 1 || type > 4) {
            System.out.println("Invalid type.");
            return;
        }
        System.out.print("ID: ");
        String id = scanner.nextLine();
        System.out.print("Name: ");
        String name = scanner.nextLine();
        Patron patron;
        if (type == 1) patron = new Student(id, name);
        else if (type == 2) patron = new Faculty(id, name);
        else if (type == 3) patron = new SeniorCitizen(id, name);
        else patron = new Child(id, name);
        patrons.add(patron);
        System.out.println("Patron added: " + name);
    }

    private static void checkoutItem(LocalDate currentDate) {
        Patron patron = selectPatron();
        if (patron == null) return;
        Material material = selectMaterial();
        if (material == null || !material.filterByAvailability()) {
            System.out.println("Material unavailable.");
            return;
        }
        if (!patron.canBorrow(material)) {
            System.out.println("Cannot borrow.");
            return;
        }
        material.checkOut(patron, currentDate);
        System.out.println("Checked out: " + material.title + ", Due: " + currentDate.plusDays(patron.getLoanPeriod()));
    }

    private static void returnItem(LocalDate currentDate) {
        Material material = selectMaterial();
        if (material == null || material.filterByAvailability()) {
            System.out.println("Material not checked out.");
            return;
        }
        double fine = material.calculateFine(currentDate);
        material.checkIn();
        for (Loan loan : loans) {
            if (loan.material == material) {
                loan.patron.fines += fine;
                loans.remove(loan);
                break;
            }
        }
        System.out.println("Returned: " + material.title + ", Fine: " + fine);
    }

    private static void calculateFines(LocalDate currentDate) {
        Patron patron = selectPatron();
        if (patron == null) return;
        double totalFines = 0.0;
        for (Loan loan : patron.loans) {
            totalFines += loan.material.calculateFine(currentDate);
        }
        patron.fines = totalFines;
        System.out.println("Total fines for " + patron.getName() + ": " + totalFines);
    }

    private static void searchMaterials() {
        System.out.println("Search by: 1. Title 2. Author 3. Advanced");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type < 1 || type > 3) {
            System.out.println("Invalid search type.");
            return;
        }
        ArrayList<Material> results = new ArrayList<>();
        if (type == 1) {
            System.out.print("Title: ");
            String title = scanner.nextLine();
            for (Material m : materials) {
                if (m.searchByTitle(title)) results.add(m);
            }
        } else if (type == 2) {
            System.out.print("Author: ");
            String author = scanner.nextLine();
            for (Material m : materials) {
                if (m.searchByAuthor(author)) results.add(m);
            }
        } else {
            System.out.print("Material type (1. Book 2. EBook 3. Audiobook 4. DVD, 0 for all): ");
            int mType = scanner.nextInt();
            System.out.print("Min year: ");
            int minYear = scanner.nextInt();
            System.out.print("Max year: ");
            int maxYear = scanner.nextInt();
            scanner.nextLine();
            System.out.print("Language: ");
            String language = scanner.nextLine();
            System.out.print("Genre: ");
            String genre = scanner.nextLine();
            System.out.print("Available only (1 for yes, 0 for no): ");
            int avail = scanner.nextInt();
            scanner.nextLine();
            for (Material m : materials) {
                boolean matches = true;
                if (mType != 0 && (
                    (mType == 1 && !(m instanceof Book)) ||
                    (mType == 2 && !(m instanceof EBook)) ||
                    (mType == 3 && !(m instanceof Audiobook)) ||
                    (mType == 4 && !(m instanceof DVD)))) {
                    matches = false;
                }
                if (m.publicationYear < minYear || m.publicationYear > maxYear) matches = false;
                if (!language.isEmpty() && !m.language.equalsIgnoreCase(language)) matches = false;
                if (!genre.isEmpty() && !m.genre.equalsIgnoreCase(genre)) matches = false;
                if (avail == 1 && !m.filterByAvailability()) matches = false;
                if (matches) results.add(m);
            }
        }
        System.out.println("Search results:");
        for (Material m : results) {
            System.out.println(m.title + " by " + m.author + (m.filterByAvailability() ? " (Available)" : " (Checked Out)"));
        }
    }

    private static void placeReservation(LocalDate currentDate) {
        Patron patron = selectPatron();
        if (patron == null) return;
        Material material = selectMaterial();
        if (material == null || material.filterByAvailability()) {
            System.out.println("Material already available.");
            return;
        }
        reservations.add(new Reservation(patron, material, currentDate));
        System.out.println("Reservation placed for " + material.title);
    }

    private static void generateReports(LocalDate currentDate) {
        System.out.println("Report type: 1. Overdue 2. Usage Statistics");
        int type = scanner.nextInt();
        scanner.nextLine();
        if (type == 1) generateOverdueReport(currentDate);
        else if (type == 2) generateUsageStatistics();
        else System.out.println("Invalid report type.");
    }
    public static void generateOverdueReport(LocalDate currentDate) {
        System.out.println("Overdue Items:");
        for (Loan loan : loans) {
            if (loan.material.isOverdue(currentDate)) {
                System.out.println(loan.material.title + " by " + loan.patron.getName() + ", Due: " + loan.dueDate);
            }
        }
    }
    public static void generateUsageStatistics() {
        System.out.println("Usage Statistics:");
        System.out.println("Total Materials: " + materials.size());
        System.out.println("Total Patrons: " + patrons.size());
        System.out.println("Total Loans: " + loans.size());
    }

    private static Patron selectPatron() {
        if (patrons.isEmpty()) {
            System.out.println("No patrons.");
            return null;
        }
        System.out.println("Select patron:");
        for (int i = 0; i < patrons.size(); i++) {
            System.out.println((i + 1) + ". " + patrons.get(i).getName());
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= patrons.size()) {
            System.out.println("Invalid patron.");
            return null;
        }
        return patrons.get(idx);
    }

    private static Material selectMaterial() {
        if (materials.isEmpty()) {
            System.out.println("No materials.");
            return null;
        }
        System.out.println("Select material:");
        for (int i = 0; i < materials.size(); i++) {
            System.out.println((i + 1) + ". " + materials.get(i).title);
        }
        int idx = scanner.nextInt() - 1;
        scanner.nextLine();
        if (idx < 0 || idx >= materials.size()) {
            System.out.println("Invalid material.");
            return null;
        }
        return materials.get(idx);
    }
}