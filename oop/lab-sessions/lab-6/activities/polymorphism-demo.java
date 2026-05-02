class Point{
    private int x;
    private int y;

    public Point() {
    }

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
    }
    public void setY(int y) {
        this.y = y;
    }
    public void display(){
        System.out.println("x="+x + "y" + y);
    }
}
class Line{
    Point p1;
    Point p2;

    public Line() {
    }

    public Line(Point p1, Point p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    public Point getP1() {
        return p1;
    }

    public Point getP2() {
        return p2;
    }
    

    public void setP1(Point p1) {
        this.p1 = p1;
    }
    public void setP2(Point p2) {
        this.p2 = p2;
    }public void length(){
        System.out.println("The length is " + Math.sqrt((p2.getX() - p1.getX())*(p2.getX() - p1.getX())) + ((p2.getY() - p1.getY())* (p2.getY() - p1.getY())));
    }
}
public class f {
    public static void main(String[] args) {
        Point p1 = new Point(8, 9);
        Point p2 = new Point(0, 7);
        Line l1 = new Line(p1, p2);
        l1.length();
    }
}
