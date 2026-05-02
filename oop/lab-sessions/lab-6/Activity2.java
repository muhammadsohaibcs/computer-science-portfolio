class commissionEmployee {
    protected String FirstName;
    protected String LastName;
    protected String SSN;
    protected double grossSales;
    protected double commonRate;

    public commissionEmployee() {
        FirstName = "Nagina";
        LastName = "Nazar";
        SSN = "S003";
        grossSales = 1234.1;
        commonRate = 12.5;
    }

    public commissionEmployee(String a, String e, String b, double c,
            double d) {
        FirstName = a;
        LastName = e;
        SSN = b;
        grossSales = c;
        commonRate = d;
    }

    public void setFN(String a) {
        FirstName = a;
    }

    public void setLN(String e) {
        LastName = e;
    }

    public void setSSN(String b) {
        SSN = b;
    }

    public void setGS(double c) {
        grossSales = c;
    }

    public void setCR(double d) {
        commonRate = d;
    }

    public String getFN() {
        return FirstName;
    }

    public String getSSN() {
        return SSN;
    }

    public double getGS() {
        return grossSales;
    }

    public double getCR() {
        return commonRate;
    }

    public double earnings() {
        return grossSales * commonRate;
    }

    public void display() {
        System.out.println("first name:" + FirstName + "last name:" + LastName + "SSN:" + SSN + " Gross Sale:"
                + grossSales + " and commonRate:" + commonRate);
    }
}

class BasePlusCommEmployee extends commissionEmployee {
    private double salary;

    BasePlusCommEmployee() {
        salary = 48000;
    }

    BasePlusCommEmployee(String A, String E, String B, double C, double D,
            double S) {
        super(A, E, B, C, D);
        salary = S;
    }

    // overridden method
    public double earnings() {
        return super.earnings() + salary;
    }

    public void display() {
        super.display();
        System.out.println("Salary : " + salary);
    }
}

public class Activity2 {
    public static void main(String args[]) {
        BasePlusCommEmployee b = new BasePlusCommEmployee("ali", "ahmed",
                "25-kkn", 100, 5.2, 25000);
        double earn = b.earnings();
        System.out.println("Earning of employee is " + earn);
    }
}
