class Computer{
    String wordSize;
    int memorySize;
    int storageSize;
    float speed;

    public Computer() {
    }

    public Computer(String wordSize, int memorySize, int storageSize, float speed) {
        this.wordSize = wordSize;
        this.memorySize = memorySize;
        this.storageSize = storageSize;
        this.speed = speed;
    }
    public int getMemorySize() {
        return memorySize;
    }
    public float getSpeed() {
        return speed;
    }
    public int getStorageSize() {
        return storageSize;
    }
    public String getWordSize() {
        return wordSize;
    }
    public void setMemorySize(int memorySize) {
        this.memorySize = memorySize;
    }
    public void setSpeed(float speed) {
        this.speed = speed;
    }
    public void setStorageSize(int storageSize) {
        this.storageSize = storageSize;
    }
    public void setWordSize(String wordSize) {
        this.wordSize = wordSize;
    }
    public void display(){
        System.out.println("The word size in bits is " + wordSize );
        System.out.println("The memory size in Mega Byte is " + memorySize);
        System.out.println("The storage size in Mega Byte in  is " + storageSize );
        System.out.println("The speed in Mega Hertz is " + speed);


    }
}
class Laptop extends Computer{
    double length;
    double width;
    double height;

    public Laptop() {
    }

    public Laptop(double length, double width, double height) {
        this.length = length;
        this.width = width;
        this.height = height;
    }

    public Laptop(double length, double width, double height, String wordSize, int memorySize, int storageSize, float speed) {
        super(wordSize, memorySize, storageSize, speed);
        this.length = length;
        this.width = width;
        this.height = height;
    }
    

    public double getHeight() {
        return height;
    }

    public double getLength() {
        return length;
    }
    public double getWidth() {
        return width;
    }
    public void setHeight(double height) {
        this.height = height;
    }
    public void setLength(double length) {
        this.length = length;
    }
    public void setWidth(double width) {
        this.width = width;
    }
    @Override
    public void display() {
        super.display();
        System.out.println("The length is " + length) ;
        System.out.println("The width is " + width) ;
        System.out.println("The heigth is " + height) ;
    }
}


public class task3 {
    public static void main(String[] args) {
        Laptop l = new Laptop(12, 3, 4, "101", 8, 4, 9);
        l.display();
    }
}
