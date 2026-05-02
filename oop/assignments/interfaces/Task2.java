interface Payable{
    Double getPaymentAmount();
}
class Invoice implements  Payable{
    private String partNumber;
    private String partDescription;
    private int quantity;
    private double pricePerItem ;

    public Invoice() {
    }

    public Invoice(String partNumber, String partDescription, int quantity, double pricePerItem) {
        this.partNumber = partNumber;
        this.partDescription = partDescription;
        this.quantity = quantity;
        this.pricePerItem = pricePerItem;
    }

    public String getPartDescription() {
        return partDescription;
    }
    @Override
    public Double getPaymentAmount() {
        return quantity*pricePerItem;
    }
    public String getPartNumber() {
        return partNumber;
    }public double getPricePerItem() {
        return pricePerItem;
    }public int getQuantity() {
        return quantity;
    }public void setPartDescription(String partDescription) {
        this.partDescription = partDescription;
    }public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }public void setPricePerItem(double pricePerItem) {
        this.pricePerItem = pricePerItem;
    }public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

}
abstract class Employee implements Payable{
    private String firstName;
    private String lastName;
    private String SSN;

    public Employee() {
    }

    public Employee(String firstName, String lastName, String SSN) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.SSN = SSN;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }public void setLastName(String lastName) {
        this.lastName = lastName;
    }public void setSSN(String sSN) {
        SSN = sSN;
    }

    public String getFirstName() {
        return firstName;
    }
    public String getLastName() {
        return lastName;
    }public String getSSN() {
        return SSN;
    }
}
class SalariedEmployee extends Employee{
    private double weeklySalary;
    public SalariedEmployee(double weeklySalary, String firstName, String lastName, String SSN) {
        super(firstName, lastName, SSN);
        this.weeklySalary = weeklySalary;
    }
    @Override
    public Double getPaymentAmount() {
        return weeklySalary*4;
    }
}
public class Task2 {
    public static void main(String[] args) {
        Invoice i = new Invoice("A", "B", 12, 1);
    Employee e = new SalariedEmployee(12, "F", "E", "D");
    System.out.println(i.getPaymentAmount());
    System.out.println(e.getPaymentAmount());
    } 
}