interface compare  
{    
boolean compareObjects(Object o); 
} 
class InventoryItem implements compare  
{ 
private String name;  
private int uniqueItemID; 

    public InventoryItem() {
    }

    public InventoryItem(String name, int uniqueItemID) {
        this.name = name;
        this.uniqueItemID = uniqueItemID;
    }
public String getName() {
    return name;
}public int getUniqueItemID() {
    return uniqueItemID;
}public void setName(String name) {
    this.name = name;
}public void setUniqueItemID(int uniqueItemID) {
    this.uniqueItemID = uniqueItemID;
} 
@Override
public boolean compareObjects(Object o) {
    if (o instanceof InventoryItem){
        InventoryItem a = (InventoryItem) o;
        return name.equalsIgnoreCase(a.getName())  && uniqueItemID == a.getUniqueItemID();
    }
    return false;
    
}
}
public class Task3 {
    public static void main(String[] args) {
        InventoryItem i = new InventoryItem("Q", 1);
        InventoryItem b = new InventoryItem("Q", 1);
        System.out.println(i.compareObjects(b));
    }
}
