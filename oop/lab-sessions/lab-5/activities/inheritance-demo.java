class Pizza{
    private String size;
    private int NoOfCheeseToppings;
    private int NoOfPepperoniToppings;
    private int NoOfHamToppings;

    public Pizza() {
    }

    public Pizza(String size, int NoOfCheeseToppings, int NoOfPepperoniToppings, int NoOfHamToppings) {
        this.size = size;
        this.NoOfCheeseToppings = NoOfCheeseToppings;
        this.NoOfPepperoniToppings = NoOfPepperoniToppings;
        this.NoOfHamToppings = NoOfHamToppings;
    }

    public void setNoOfCheeseToppings(int NoOfCheeseToppings) {
        this.NoOfCheeseToppings = NoOfCheeseToppings;
    }

    public void setNoOfHamToppings(int NoOfHamToppings) {
        this.NoOfHamToppings = NoOfHamToppings;
    }

    public void setNoOfPepperoniToppings(int NoOfPepperoniToppings) {
        this.NoOfPepperoniToppings = NoOfPepperoniToppings;
    }
    public void setSize(String size) {
        this.size = size;
    }
    public int getNoOfCheeseToppings() {
        return NoOfCheeseToppings;
    }
    public int getNoOfHamToppings() {
        return NoOfHamToppings;
    }
    public int getNoOfPepperoniToppings() {
        return NoOfPepperoniToppings;
    }
    public String getSize() {
        return size;
    }
    public void getDiscription(){
        System.out.println(size);
        System.out.println(NoOfCheeseToppings);
        System.out.println(NoOfHamToppings);
        System.out.println(NoOfPepperoniToppings);
    }
    public int calcCost(){
        int toppings = NoOfCheeseToppings + NoOfHamToppings + NoOfPepperoniToppings;
        if (size.equalsIgnoreCase("Small"))
            return 10+ (2*toppings);
        else if (size.equalsIgnoreCase("medium"))
            return 12+ (2*toppings);
        else if (size.equalsIgnoreCase("large"))
            return 14+ (2*toppings);
        System.out.println("Ypu have not entered a valid size.Please set it size Otherwise it is not included in order");
        return 0;
    }
}
class PizzaOrder{
    Pizza p1 ;
    Pizza p2;
    Pizza p3 ;

    public PizzaOrder() {
    }
    public PizzaOrder(Pizza p1) {
        this.p1 = p1;
    }

    public PizzaOrder(Pizza p1, Pizza p2) {
        this.p1 = p1;
        this.p2 = p2;
        
    }

    public PizzaOrder(Pizza p1, Pizza p2, Pizza p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    public void setP1(Pizza p1) {
        this.p1 = p1;
    }

    public void setP2(Pizza p2) {
        this.p2 = p2;
    }

    public void setP3(Pizza p3) {
        this.p3 = p3;
    }
    public Pizza getP1() {
        return p1;
    }
    public Pizza getP2() {
        return p2;
    }
    public Pizza getP3() {
        return p3;
    }
    public void calcTotal(){
        int sum = 0;
        
        if (p1!= null)
            sum += p1.calcCost();
        if (p2!= null)
            sum += p2.calcCost();
        if (p3!= null)
            sum += p3.calcCost();
        System.out.println("The cost of ordered pizzas is " + sum);
    }
}
public class g {
    public static void main(String[] args) {
        Pizza p1 = new Pizza("large", 1, 2, 4);
        Pizza p2 = new Pizza("largee", 1, 2, 4);
        PizzaOrder o1 = new PizzaOrder(p1, p2);
        o1.calcTotal();
    }
}
