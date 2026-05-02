interface Enumeration  
{ 
public boolean hasNext(int index);  

public Object getNext(int index);  
}

class NameCollection  implements Enumeration 
{ 
String[] names = new String[100];  
static int i = 0;

    public NameCollection() {
    }
    
    public NameCollection(String name) {
        addElements(name);
    }
    public void addElements(String name){
        if (i>=100){
            System.out.println("Array is FULL");
            return;
        }
        if (i<-1){
            System.out.println("Index cannot be less than -1");
            return ;
        }
        names[i] = name;
        i++;
    }
    public boolean hasNext(int index){
        return index<i-1 && i>-1;
    }
    public Object getNext(int index){
        if (index<i+1 && i>-1){
            return names[index+1];
        }
        if (i<-1){
            System.out.println("Index cannot be less than -1");
            return null;
        }
        System.out.println("Index out of bound");
        return null; 
    }
} 
class Task4{
    public static void main(String[] args) {
        NameCollection a = new NameCollection("A");
        a.addElements("B");
        a.addElements("C");
        a.addElements("D");
        a.addElements("E");
        int index =-1;
        while (a.hasNext(index)){
            System.out.println(a.getNext(index));
            index++;
        }
        
        

    }
}