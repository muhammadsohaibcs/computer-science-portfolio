class Package{
    String senderName ;
    String senderAddress ;
    String recipientName;
    String recipientAddress;
    double weight;
    double cost;

    public Package() {
    }

    public Package(String senderName, String senderAddress, String recipientName, String recipientAddress, double weight, double cost) {
        this.senderName = senderName;
        this.senderAddress = senderAddress;
        this.recipientName = recipientName;
        this.recipientAddress = recipientAddress;
        if (weight>0)
            this.weight = weight;
        else{
            System.out.println("Weight is Invalid");
        }
        if (cost>0)
            this.cost = cost;
        else{
            System.out.println("Cost is Invalid");
        }
        
    }

    public double getCost() {
        return cost;
    }

    public String getRecipientAddress() {
        return recipientAddress;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getSenderAddress() {
        return senderAddress;
    }

    public String getSenderName() {
        return senderName;
    }
    public double getWeight() {
        return weight;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public void setRecipientAddress(String recipientAddress) {
        this.recipientAddress = recipientAddress;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public void setSenderAddress(String senderAddress) {
        this.senderAddress = senderAddress;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public void setWeight(double weight) {
        if (weight>0)
            this.weight = weight;
    }
    
    public double calculateCost() {
        return weight *cost;
    }
    
    


    
}
class TwoDayPackage extends Package {
    double flatFee;

    public TwoDayPackage() {
    }

    public TwoDayPackage(double flatFee) {
        this.flatFee = flatFee;
    }

    public TwoDayPackage(double flatFee, String senderName, String senderAddress, String recipientName, String recipientAddress, double weight, double cost) {
        super(senderName, senderAddress, recipientName, recipientAddress, weight, cost);
        this.flatFee = flatFee;
    }


    public void setFlatFee(double flatFee) {
        this.flatFee = flatFee;
    }

    public double getFlatFee() {
        return flatFee;
    }

    @Override
    public double calculateCost() {
        return super.calculateCost()+flatFee;
    }
    
    
    
}
class OvernightPackage extends Package {
    double additionalFee ;

    public OvernightPackage() {
    }

    public OvernightPackage(double additionalFee) {
        this.additionalFee = additionalFee;
    }

    public OvernightPackage(double additionalFee, String senderName, String senderAddress, String recipientName, String recipientAddress, double weight, double cost) {
        super(senderName, senderAddress, recipientName, recipientAddress, weight, cost);
        this.additionalFee = additionalFee;
    }

    @Override
    public double calculateCost() {
        return super.calculateCost()+additionalFee;
    }

    public void setAdditionalFee(double additionalFee) {
        this.additionalFee = additionalFee;
    }

    public double getAdditionalFee() {
        return additionalFee;
    }
    
}

class b {
    public static void main(String[] args) {
        Package regularPackage = new Package("Sohaib", "123", "B", "456 ", 10, 0.5);
        TwoDayPackage twoDay = new TwoDayPackage(5.0, "C", "789 ", "D", "101", 8, 0.75);
        OvernightPackage overnight = new OvernightPackage(10.0, "E", "202", "F", "303", 6, 1.0);
        Package[] packages = {regularPackage, twoDay, overnight};
        for (Package p : packages) {
            System.out.println("Sender: " + p.getSenderName() + ", Recipient: " + p.getRecipientName());
            System.out.println("Cost: " + p.calculateCost());
        }
    }
}

