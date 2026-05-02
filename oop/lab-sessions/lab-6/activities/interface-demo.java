
class Address{
    private int streetNo;
    private int houseNo;
    private String city;
    private int code;

    public Address() {
    }

    public Address(int streetNo, int houseNo, String city, int code) {
        this.streetNo = streetNo;
        this.houseNo = houseNo;
        this.city = city;
        this.code = code;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCode(int code) {
        this.code = code;
    }
    public void setHouseNo(int houseNo) {
        this.houseNo = houseNo;
    }public void setStreetNo(int streetNo) {
        this.streetNo = streetNo;
    }

    public String getCity() {
        return city;
    }

    public int getCode() {
        return code;
    }

    public int getHouseNo() {
        return houseNo;
    }
    public int getStreetNo() {
        return streetNo;
    }
}
class Person {
    private String name;
    private Address address;

    public Person() {
    }

    public Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Address getAddress() {
        return address;
    }

    public String getName() {
        return name;
    }
    
}
class Book{
    private String bookName;
    private Person author;
    Book(){

    }

    public Book(String bookName, Person author) {
        this.bookName = bookName;
        this.author = author;
    }

    public void setAuthor(Person author) {
        this.author = author;
    }
    public void setBookName(String bookName) {
        this.bookName = bookName;
    }
    public Person getAuthor() {
        return author;
    }
    public String getBookName() {
        return bookName;
    }
}
    
public class e {
    public static void main(String[] args) {
        Address a1 = new Address(12, 13, "Islamabad", 90);
        Address a2 = new Address(18, 19, "Islamabad", 80);
        Person  p1 = new Person("A",a1);
        Book b1 = new Book("D", p1);
        b1.getAuthor().setAddress(a2);
    }
}
