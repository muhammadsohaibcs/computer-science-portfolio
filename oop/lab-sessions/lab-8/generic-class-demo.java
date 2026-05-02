
import java.util.ArrayList;

abstract  class  Convert{
    private double val1;
    private double val2;
    public  abstract void compute();

    public double getVal1() {
        return val1;
    }

    public double getVal2() {
        return val2;
    }

    public void setVal1(double val1) {
        this.val1 = val1;
    }

    public void setVal2(double val2) {
        this.val2 = val2;
    }

}
class l_to_g extends Convert{
    public l_to_g() {
    }
    

    public l_to_g(double v ) {
        super.setVal1(v);
    }

    @Override
    public void compute() {
        super.setVal2(getVal1()/10);
    }
    

}
class f_to_c extends Convert{

    public f_to_c() {
    }
    public f_to_c(double v){
        super.setVal1(v);
    }
    @Override
    public void compute() {
        super.setVal2(5.0/9*(getVal1()-32));
    }
}
class f_to_m extends Convert{

    public f_to_m() {
    }
    public f_to_m(double v){
        super.setVal1(v);
    }
    @Override
    public void compute() {
        super.setVal2(getVal1()/3.6);
    }
}
public class c {
    public static void main(String[] args) {
        ArrayList <String> a;
        Convert conv1 = new l_to_g(20.5); 
        conv1.compute();
        System.out.println(conv1.getVal1() + " liters = " + conv1.getVal2() + " gallons");

        Convert conv2 = new f_to_c(100); 
        conv2.compute();
        System.out.println(conv2.getVal1() + "°F = " + conv2.getVal2() + "°C");
        Convert conv3 = new f_to_m(100);
        conv3.compute();
        System.out.println(conv3.getVal1() + " feet = " + conv3.getVal2() + " meters");
    }
}
