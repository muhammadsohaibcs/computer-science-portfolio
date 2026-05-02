import java.awt.*;
import java.io.*;
import java.util.*;
import javax.swing.*;

class CityRespositry<T extends CityResource> implements Serializable {

    public void addResource(T res) {
        ArrayList<CityResource> allResources = readAllResources();
        allResources.add(res);
        writeAllResources(allResources);
    }

    public void removeResource(String id) {
        ArrayList<CityResource> allResources = readAllResources();

        for (int i = 0; i < allResources.size(); i++) {
            if (allResources.get(i).getResourceID().equalsIgnoreCase(id)) {

                if(allResources.get(i) instanceof PowerStation){
                    PowerStation p = (PowerStation)allResources.get(i);
                    double o = PowerStation.getTotalOutputRate();
                    PowerStation.setTotalOutputRate(o - p.getOutputRate());
                }

                allResources.remove(i);
                break;
            }
        }

        writeAllResources(allResources);
    }
    public ArrayList<CityResource> selectByLocation(String location) {
        ArrayList<CityResource> allResources = readAllResources();
        ArrayList<CityResource> newResources = new ArrayList<>();

        for (int i = 0; i < allResources.size(); i++) {
            if (allResources.get(i).getLocation().equalsIgnoreCase(location)) {
                newResources.add(allResources.get(i));

            }     
        }
        return newResources;

    }

    public <S extends CityResource> S getResourceByID(String id, Class<S> clazz) {
        ArrayList<CityResource> allResources = readAllResources();

        for (CityResource resource : allResources) {
            if (clazz.isInstance(resource) && resource.getResourceID().equalsIgnoreCase(id)) {
                return (S) resource;
            }
        }

        return null;
    }

    public void updateResource(CityResource updated){
        ArrayList<CityResource> allResources = readAllResources();

        for (int i = 0; i < allResources.size(); i++) {

            if (allResources.get(i).getResourceID().equalsIgnoreCase(updated.getResourceID())) {
                allResources.set(i, updated);
                break;
            }
        }

        writeAllResources(allResources);
    }

    public <S extends CityResource> ArrayList<S> displayAll(Class<S> clazz){

        ArrayList<S> specificResources = new ArrayList<>();
        ArrayList<CityResource> allResources = readAllResources();
        for (CityResource resource : allResources) {

            if (clazz.isInstance(resource)) {
                specificResources.add(clazz.cast(resource));
            }
        }

        return specificResources;
    }

    private ArrayList<CityResource> readAllResources() {
        ArrayList<CityResource> resources = new ArrayList<>();
        File file = new File("SmartCityRecord.ser");

        if (!file.exists() || file.length() == 0) {
            return resources;
        }

        try{
            ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file));

            while (true) {
                try {
                    CityResource res = (CityResource) ois.readObject();
                    resources.add(res);
                }
                catch (EOFException eof) {
                    break;
                }

            }
            ois.close();
        } 
        catch (IOException | ClassNotFoundException e) {

        }

        return resources;
    }

    private void writeAllResources(ArrayList<CityResource> resources) {
        try{
            ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("SmartCityRecord.ser"));

            for (CityResource resource : resources) {
                oos.writeObject(resource);
            }
            oos.close();

        } 
        catch (IOException e){
            System.out.println("Error writing resource file: " + e.getMessage());
        }
    }

}


abstract class CityResource implements Reportable, Serializable {

    protected static final long serialVersionUID = 1L; 
    protected static CityRespositry<CityResource> repoResources = new CityRespositry<>();
    protected String resourceID;
    protected String location;
    protected String status;
    protected String hubId;
    protected String zoneId;

    CityResource(String id, String loc, String st, String hubId, String zoneId) {
        this.resourceID = id;
        this.location = loc;
        this.status = st;
        this.hubId = hubId;
        this.zoneId = zoneId;
    }

    public abstract double calcMaintanenceCost();

    public static void updateStatus(String id, String st) {

        CityResource c = repoResources.getResourceByID(id, CityResource.class);

        if (c != null) {
            c.setStatus(st);
            repoResources.updateResource(c);
        } 
        else {
            System.out.println("Resource " + id + " does not exist");
        }
    }

    public String getResourceID() {
        return resourceID;
    }

    public void setResourceID(String resourceID) {
        this.resourceID = resourceID;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHubId() {
        return hubId;
    }

    public void setHubId(String hubId) {
        this.hubId = hubId;
    }

    @Override
    public String toString() {
        return "\nResourceID: " + resourceID + " | Hub ID: " + hubId + " | Zone ID: " + zoneId + "\nLocation: " + location + " (" + status + ")";
    }

}

abstract class TransportUnit extends CityResource {

    private int passengerCount;
    private double fuelCost;
    private double distance;

    public TransportUnit(String id, String loc, String st, String hubId, String zoneId, int pcount, double fcost, double dist) {

        super(id, loc, st, hubId, zoneId);

        passengerCount = pcount;
        fuelCost = fcost;
        distance = dist;
    }

    public static ArrayList<TransportUnit> inactiveUnits() {
        ArrayList<TransportUnit> resources = new ArrayList<>();

        ArrayList<TransportUnit> allTUs = new CityRespositry<>().displayAll(TransportUnit.class);

        for (TransportUnit unit : allTUs) {
            if (unit.getStatus().equalsIgnoreCase("inactive")) {
                resources.add(unit);
            }
        }

        return resources;
    }

    public int getPassengerCount() {
        return passengerCount;
    }
    public void setPassengerCount(int passengerCount) {
        this.passengerCount = passengerCount;
    }
    public double getFuelCost() {
        return fuelCost;
    }
    public void setFuelCost(double fuelCost) {
        this.fuelCost = fuelCost;
    }
    public double getDistance() {
        return distance;
    }
    public void setDistance(double distance) {
        this.distance = distance;
    }

}

class Bus extends TransportUnit{

    public Bus(String id, String loc, String st, String hubId, String zoneId, int pcount, double fcost, double dist) {

        super(id, loc, st, hubId, zoneId, pcount, fcost, dist);
        CityResource.repoResources.addResource(this);
    }

    @Override
    public double calcMaintanenceCost() {
        return getFuelCost() * getDistance();
    }

    @Override
    public String generateUsageReport() {
        return ("\nMaintanence Cost of T.U " + resourceID + " is " + calcMaintanenceCost() + "\nNo Of Passengers " + getPassengerCount() + "\nDistance Travelled: " + getDistance());
    }

    @Override
    public String toString() {
        return super.toString() + "\nTransport | Passengers: " + getPassengerCount() + " | Type: Bus";
    }

}

class Train extends TransportUnit {

    public Train(String id, String loc, String st, String hubId, String zoneId, int pcount, double fcost, double dist) {
        super(id, loc, st, hubId, zoneId, pcount, fcost, dist);
        CityResource.repoResources.addResource(this);
    }

    @Override
    public double calcMaintanenceCost() {
        return getFuelCost() * getDistance();
    }

    @Override
    public String generateUsageReport() {
        return ("\n\nMaintanence Cost of T.U " + resourceID + " is " + calcMaintanenceCost() + "\nNo Of Passengers " + getPassengerCount() + "\nDistance Travelled: " + getDistance());
    }

    @Override
    public String toString() {
        return super.toString() + "\nTransport | Passengers: " + getPassengerCount() + " | Type: Train";
    }

}

class PowerStation extends CityResource implements Alertable {
    private double outputRate;
    private double costPerHour;
    private boolean riskToOutages;
    private String gridId;
    private static double totalOutputRate = 0;
    public static ArrayList<SmartGrid> allSmartGrids = new ArrayList<>();

    PowerStation(String id, String loc, String st, String hubId, String zoneId, String gridId, double rate, double cost, boolean risk) {
        super(id, loc, st, hubId, zoneId);
        outputRate = rate;
        costPerHour = cost;
        riskToOutages = risk;
        this.gridId = gridId;
        CityResource.repoResources.addResource(this);
        totalOutputRate += outputRate;
    }

    public static ArrayList<PowerStation> atRiskStations() {

        ArrayList<PowerStation> resources = new ArrayList<>();
        ArrayList<PowerStation> allPS = new CityRespositry<>().displayAll(PowerStation.class);

        for (PowerStation station : allPS) {
            if (station.isRiskToOutages()) {
                resources.add(station);
            }
        }

        return resources;
    }

    public static void updateRisk(String id, String st) {
        
        PowerStation c = CityResource.repoResources.getResourceByID(id, PowerStation.class);

        if (c == null) {
            System.out.println("Resource " + id + " does not exist");
            return;
        }

        c.setRiskToOutages(st.equalsIgnoreCase("yes"));
        CityResource.repoResources.updateResource(c);
    }

    @Override
    public double calcMaintanenceCost() {
        return outputRate * costPerHour;
    }

    @Override
    public String generateUsageReport() {
        return ("\n\nMaintanence Cost of P.S " + resourceID + " is " + calcMaintanenceCost() + "\nOutput Rate: " + getOutputRate() + "\nCost Per Hour: " + getCostPerHour());
    }

    @Override
    public String sendEmergencyAlert() {
        return riskToOutages ? ("\n\nOUTAGE RISK at Power Station: " + resourceID) : ("\n\nActive: No Risk at Power Station: " + resourceID);
    }

    @Override
    public String toString() {
        return super.toString() + "\nPower Station | Output Rate: " + outputRate + " KWH \nGrid ID: " + gridId;
    }

    public double getOutputRate() {
        return outputRate;
    }
    public void setOutputRate(double outputRate) {
        this.outputRate = outputRate;
    }
    public double getCostPerHour() {
        return costPerHour;
    }
    public void setCostPerHour(double costPerHour) {
        this.costPerHour = costPerHour;
    }
    public boolean isRiskToOutages() {
        return riskToOutages;
    }
    public void setRiskToOutages(boolean riskToOutages) {
        this.riskToOutages = riskToOutages;
    }
    public static void setTotalOutputRate(double totalOutputRate) {
        PowerStation.totalOutputRate = totalOutputRate;
    }
    public static double getTotalOutputRate() {
        return totalOutputRate;
    }

}

class SmartGrid {
    private String gridId;
    private String girdName;
    private ArrayList<PowerStation> powerStations;
    private ArrayList<Consumer> Consumers;

    public SmartGrid(String gridId, String girdName) {
        this.gridId = gridId;
        this.girdName = girdName;
        this.powerStations = new ArrayList<>();
        this.Consumers = new ArrayList<>();
    }

    public void addPowerStation(PowerStation p) {
        powerStations.add(p);
    }

    public void addConsumer(Consumer c) {
        Consumers.add(c);
    }

    public String getGridId() {
        return gridId;
    }

    public void setGridId(String gridId) {
        this.gridId = gridId;
    }

    public String getGirdName() {
        return girdName;
    }

    public void setGirdName(String girdName) {
        this.girdName = girdName;
    }

    public ArrayList<PowerStation> getPowerStations() {
        return powerStations;
    }

    public ArrayList<Consumer> getConsumers() {
        return Consumers;
    }

}

class Consumer {
    String consumerId;
    String ConsumerType;
    String location;

    public Consumer(String consumerId, String ConsumerType, String location) {
        this.consumerId = consumerId;
        this.ConsumerType = ConsumerType;
        this.location = location;
    }
    public String getConsumerId() {
        return consumerId;
    }
    public void setConsumerId(String consumerId) {
        this.consumerId = consumerId;
    }
    public String getConsumerType() {
        return ConsumerType;
    }
    public void setConsumerType(String ConsumerType) {
        this.ConsumerType = ConsumerType;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
}

class EmergencyService extends CityResource implements Alertable {
    private String type;
    private int noOfEmployees;
    private int noOfEquipments;
    private double costPerEntity;

    EmergencyService(String id, String loc, String st, String hubId, String zoneId, String typ, int emps, int equips, double cost) {

        super(id, loc, st, hubId, zoneId);

        type = typ;
        noOfEmployees = emps;
        noOfEquipments = equips;
        costPerEntity = cost;

        CityResource.repoResources.addResource(this);
    }

    @Override
    public double calcMaintanenceCost() {
        return (double) (noOfEmployees + noOfEquipments) * costPerEntity;
    }

    @Override
    public String generateUsageReport() {
        return ("\n\nMaintanence Cost of E.S " + getResourceID() + " is " + calcMaintanenceCost() + "\nEmployees: " + getNoOfEmployees() + " ,Equipments: " + getNoOfEquipments() + "\nCost Per Entity: " + getCostPerEntity());
    }

    @Override
    public String sendEmergencyAlert() {
        return ("\n\nEMERGENCY ALERT triggered by: " + getResourceID());
    }

    @Override
    public String toString() {
        return super.toString() + "\nType: " + getType() + " | Employees: " + getNoOfEmployees() + " | Equipments: " + getNoOfEquipments();
    }

    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public int getNoOfEmployees() {
        return noOfEmployees;
    }
    public void setNoOfEmployees(int noOfEmployees) {
        this.noOfEmployees = noOfEmployees;
    }
    public int getNoOfEquipments() {
        return noOfEquipments;
    }
    public void setNoOfEquipments(int noOfEquipments) {
        this.noOfEquipments = noOfEquipments;
    }
    public double getCostPerEntity() {
        return costPerEntity;
    }
    public void setCostPerEntity(double costPerEntity) {
        this.costPerEntity = costPerEntity;
    }

}

interface Alertable {
    String sendEmergencyAlert();
}

interface Reportable {
    String generateUsageReport();
}

class CityZone {
    static ArrayList<CityZone> allCityZones = new ArrayList<>();
    String zoneName;
    String zoneId;
    ArrayList<ResourceHub> hubs;

    public CityZone(String zoneName, String zoneId) {
        this.zoneName = zoneName;
        this.zoneId = zoneId;
        this.hubs = new ArrayList<>();
    }

    public static boolean isZoneIdUnique(String id) {
        for (CityZone zone : allCityZones) {
            if (zone.getZoneId().equalsIgnoreCase(id)) {
                return false;
            }
        }

        return true;
    }

    public void addResourceHub(ResourceHub h) {
        hubs.add(h);
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public String getZoneId() {
        return zoneId;
    }

    public void setZoneId(String zoneId) {
        this.zoneId = zoneId;
    }

    public ArrayList<ResourceHub> getHubs() {
        return hubs;
    }

    @Override
    public String toString() {
        return "Zone [ID=" + zoneId + ", Name=" + zoneName + ", Hubs=" + hubs.size() + "]";
    }
}

class ResourceHub {
    private static ArrayList<ResourceHub> allResourceHubs = new ArrayList<>();
    private String hubId;
    private String hubName;
    private String zoneId;
    private ArrayList<CityResource> cityResources;

    public ResourceHub(String hubId, String hubName, String zoneId) {
        this.hubId = hubId;
        this.hubName = hubName;
        this.zoneId = zoneId;
        this.cityResources = new ArrayList<>();
    }

    public static boolean hubExists(String id) {
        if (id == null || id.trim().isEmpty()) 
            return false;
        
        for (ResourceHub hub : allResourceHubs) {

            if (hub.getHubId().equalsIgnoreCase(id)) {
                return true;
            }
        }

        return false;
    }

    public static boolean isHubIdUnique(String id) {

        for (ResourceHub hub : allResourceHubs) {
            if (hub.getHubId().equalsIgnoreCase(id)) {
                return false;
            }
        }

        return true;
    }

    public static String getZoneId(String hId){

        for (ResourceHub hub : allResourceHubs) {
            if (hub.getHubId().equalsIgnoreCase(hId)) {
                return hub.getZoneId();
            }
        }

        return null;
    }

    public static void addHub(ResourceHub hub) {
        allResourceHubs.add(hub);
    }

    public void addCityResource(CityResource c) {
        cityResources.add(c);
    }

    public static ArrayList<ResourceHub> getAllResourceHubs() {
        return allResourceHubs;
    }

    public String getHubId() {
        return hubId;
    }

    public String getHubName() {
        return hubName;
    }

    public void setHubName(String hubName) {
        this.hubName = hubName;
    }

    public String getZoneId() {
        return zoneId;
    }

    public ArrayList<CityResource> getCityResources() {
        return cityResources;
    }

    @Override
    public String toString() {
        return "Hub [ID=" + hubId + ", Name=" + hubName + ", Zone=" + zoneId + "]";
    }
}

public class SmartCityMS extends JFrame {

    public SmartCityMS() {

        setTitle("Main Panel");
        setSize(1200, 800);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        JLabel header = new JLabel("Smart City Management System - Admin Panel", SwingConstants.CENTER);
        header.setFont(new Font("Arial", Font.BOLD, 30));
        header.setBorder(BorderFactory.createEmptyBorder(50, 10, 50, 10));
        header.setBackground(Color.BLACK);
        header.setForeground(Color.WHITE);
        header.setOpaque(true);

        add(header, BorderLayout.NORTH);

        JPanel contentPanel = new JPanel();
        contentPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 20, 200));
        contentPanel.setBackground(new Color(238, 238, 238));

        String[] views = {"Public", "Admin"};
        JComboBox<String> viewsAns = new JComboBox<>(views);
        viewsAns.setFont(new Font("Arial", Font.PLAIN, 18));
        viewsAns.setPreferredSize(new Dimension(250, 40));

        JButton submitBtn = new JButton("Submit");
        submitBtn.setFont(new Font("Arial", Font.BOLD, 16));
        submitBtn.setPreferredSize(new Dimension(150, 40));
        submitBtn.setBackground(Color.BLACK);
        submitBtn.setForeground(Color.WHITE);
        submitBtn.setFocusPainted(false);

        contentPanel.add(viewsAns);
        contentPanel.add(submitBtn);

        add(contentPanel, BorderLayout.CENTER);

        submitBtn.addActionListener(e -> {
            if (viewsAns.getSelectedIndex() == 1){
                new AdminPanel();
            } 
            else{
                new PublicPanel();
            }

            dispose();
        });

        JLabel footer = new JLabel("© 2025 SmartCityMS. All Rights Reserved.", SwingConstants.CENTER);
        footer.setFont(new Font("SansSerif", Font.ITALIC, 14));
        footer.setBorder(BorderFactory.createEmptyBorder(30, 10, 30, 10));
        footer.setBackground(Color.LIGHT_GRAY);
        footer.setOpaque(true);

        add(footer, BorderLayout.SOUTH);

        setVisible(true);
    }

    public static void main(String[] args) {

        CityZone zone1 = new CityZone("Downtown", "Z-01");
        CityZone zone2 = new CityZone("EastCoast", "Z-02");
        CityZone zone3 = new CityZone("TownHill", "Z-03");
        CityZone zone5 = new CityZone("NYC", "Z-05");
        CityZone zone4 = new CityZone("SeaView", "Z-04");
        CityZone.allCityZones.add(zone1);
        CityZone.allCityZones.add(zone2);
        CityZone.allCityZones.add(zone3);
        CityZone.allCityZones.add(zone4);
        CityZone.allCityZones.add(zone5);
        ResourceHub.addHub(new ResourceHub("HUB-01", "Central Transport", "Z-01"));
        ResourceHub.addHub(new ResourceHub("HUB-02", "Civic Services", "Z-02"));
        ResourceHub.addHub(new ResourceHub("HUB-03", "Rescue Services", "Z-03"));
        ResourceHub.addHub(new ResourceHub("HUB-04", "Security Force", "Z-04"));
        ResourceHub.addHub(new ResourceHub("HUB-05", "Local Bodies", "Z-05"));

        new SmartCityMS();

    }
}

class AdminPanel extends JFrame {

    public AdminPanel() {

        setTitle("Admin Panel");
        setSize(1200, 800);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());
        getContentPane().setBackground(Color.DARK_GRAY);

        JLabel header = new JLabel("Smart City Management System - Admin Panel", SwingConstants.CENTER);
        header.setFont(new Font("Arial", Font.BOLD, 30));
        header.setBorder(BorderFactory.createEmptyBorder(50, 10, 50, 10));
        header.setBackground(Color.BLACK);
        header.setForeground(Color.WHITE);
        header.setOpaque(true);

        JPanel west = new JPanel();
        west.setLayout(new GridLayout(8, 1, 10, 10));
        west.setBackground(Color.DARK_GRAY);

        JButton addBusBtn = new JButton("Add Bus");
        addBusBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addBusBtn.setBackground(Color.BLACK);
        addBusBtn.setForeground(Color.CYAN);
        addBusBtn.setPreferredSize(new Dimension(300, 40));

        JButton addTrainBtn = new JButton("Add Train");
        addTrainBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addTrainBtn.setBackground(Color.BLACK);
        addTrainBtn.setForeground(Color.CYAN);

        JButton addPowerStationBtn = new JButton("Add Power Station");
        addPowerStationBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addPowerStationBtn.setBackground(Color.BLACK);
        addPowerStationBtn.setForeground(Color.CYAN);

        JButton addEmergencyServiceBtn = new JButton("Add Emergency Service");
        addEmergencyServiceBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addEmergencyServiceBtn.setBackground(Color.BLACK);
        addEmergencyServiceBtn.setForeground(Color.CYAN);

        JButton addCityZoneBtn = new JButton("Add City Zone");
        addCityZoneBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addCityZoneBtn.setBackground(Color.BLACK);
        addCityZoneBtn.setForeground(Color.CYAN);

        JButton addResourceHubBtn = new JButton("Add Resource Hub");
        addResourceHubBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addResourceHubBtn.setBackground(Color.BLACK);
        addResourceHubBtn.setForeground(Color.CYAN);

        JButton addSmartGridBtn = new JButton("Add Smart Grid");
        addSmartGridBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        addSmartGridBtn.setBackground(Color.BLACK);
        addSmartGridBtn.setForeground(Color.CYAN);

        JButton backBtn = new JButton("<< Back to Menu");
        backBtn.setForeground(new Color(220, 53, 69));
        backBtn.setBackground(Color.LIGHT_GRAY);
        backBtn.setBorder(BorderFactory.createLineBorder(Color.BLACK, 2));

        west.add(addCityZoneBtn);
        west.add(addResourceHubBtn);
        west.add(addSmartGridBtn);
        west.add(addBusBtn);
        west.add(addTrainBtn);
        west.add(addPowerStationBtn);
        west.add(addEmergencyServiceBtn);
        west.add(backBtn);

        west.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 10));

        JButton deleteResourcesBtn = new JButton("Delete Any Resources");
        deleteResourcesBtn.setPreferredSize(new Dimension(250, 30));
        deleteResourcesBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        deleteResourcesBtn.setBackground(Color.BLACK);
        deleteResourcesBtn.setForeground(Color.CYAN);

        JButton updateStatusBtn = new JButton("Update Resource Status");
        updateStatusBtn.setPreferredSize(new Dimension(250, 30));
        updateStatusBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        updateStatusBtn.setBackground(Color.BLACK);
        updateStatusBtn.setForeground(Color.CYAN);


        JButton updateRiskStatusBtn = new JButton("Update P.S Risk Status");
        updateRiskStatusBtn.setPreferredSize(new Dimension(250, 30));
        updateRiskStatusBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        updateRiskStatusBtn.setBackground(Color.BLACK);
        updateRiskStatusBtn.setForeground(Color.CYAN);


        addBusBtn.addActionListener(e -> new AddBusFrame());
        addTrainBtn.addActionListener(e -> new AddTrainFrame());
        addPowerStationBtn.addActionListener(e -> new AddPowerStationFrame());
        addEmergencyServiceBtn.addActionListener(e -> new AddEmergencyServiceFrame());
        updateStatusBtn.addActionListener(e -> new UpdateStatusFrame());
        updateRiskStatusBtn.addActionListener(e -> new UpdateRiskStatusFrame());
        deleteResourcesBtn.addActionListener(e -> new DeleteResourceFrame());
        addCityZoneBtn.addActionListener(e -> new AddCityZoneFrame());
        addResourceHubBtn.addActionListener(e -> new AddResourceHubFrame());
        addSmartGridBtn.addActionListener(e -> new AddGridFrame());
        backBtn.addActionListener(e -> {
            new SmartCityMS();
            dispose();
        });

        JLabel tools = new JLabel("Tools:", SwingConstants.CENTER);
        tools.setFont(new Font("Ariel", Font.BOLD, 15));
        tools.setBorder(BorderFactory.createEmptyBorder(20, 5, 10, 5));
        tools.setForeground(Color.WHITE);

        JPanel tBtns = new JPanel();
        tBtns.setBackground(Color.DARK_GRAY);
        tBtns.setLayout(new GridLayout(4, 1, 25, 5));
        tBtns.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 20));
        tBtns.add(updateStatusBtn);
        tBtns.add(updateRiskStatusBtn);
        tBtns.add(deleteResourcesBtn);

        JPanel eastB = new JPanel();
        eastB.setBackground(Color.DARK_GRAY);
        eastB.setLayout(new BorderLayout());
        eastB.add(tools, BorderLayout.NORTH);
        eastB.add(tBtns, BorderLayout.CENTER);

        JLabel updates = new JLabel("Last Added Resource:");
        updates.setFont(new Font("Arial", Font.BOLD, 15));
        updates.setForeground(Color.WHITE);

        JTextArea displayArea = new JTextArea();
        displayArea.setFont(new Font("Arial", Font.PLAIN, 13));
        displayArea.setBackground(Color.BLACK);
        displayArea.setForeground(Color.WHITE);
        displayArea.setEditable(false);
        displayArea.setPreferredSize(new Dimension(300, 140));

        JButton refresh = new JButton("Refresh");
        refresh.setBorder(BorderFactory.createLineBorder(Color.GRAY, 3));
        refresh.setBackground(Color.BLACK);
        refresh.setForeground(Color.WHITE);
        refresh.setPreferredSize(new Dimension(150, 30));

        refresh.addActionListener(e -> {

            ArrayList<CityResource> all = CityResource.repoResources.displayAll(CityResource.class);

            if (!all.isEmpty()) {
                displayArea.setText(all.get(all.size() - 1).toString());
            }
            else {
                displayArea.setText("No resources found.");
            }

        });

        JPanel p3 = new JPanel();
        p3.setBackground(Color.DARK_GRAY);
        p3.setLayout(new BorderLayout());
        p3.setBorder(BorderFactory.createEmptyBorder(30, 0, 15, 0));
        p3.add(updates);

        JPanel p4 = new JPanel();
        p4.setLayout(new BorderLayout());
        p4.setBackground(Color.DARK_GRAY);
        p4.setBorder(BorderFactory.createEmptyBorder(15, 0, 20, 0));
        p4.add(refresh);

        JPanel eastA = new JPanel();
        eastA.setBackground(Color.DARK_GRAY);
        eastA.setLayout(new BorderLayout());
        eastA.add(p3, BorderLayout.NORTH);
        eastA.add(displayArea, BorderLayout.CENTER);
        eastA.add(p4, BorderLayout.SOUTH);

        eastA.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextArea displayCenter = new JTextArea(10, 30);
        displayCenter.setEditable(false);
        displayCenter.setFont(new Font("Monospaced", Font.PLAIN, 15));
        displayCenter.setBackground(Color.BLACK);
        displayCenter.setForeground(Color.WHITE);

        JScrollPane scroll = new JScrollPane(displayCenter);
        scroll.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        scroll.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        scroll.setBorder(BorderFactory.createEmptyBorder(10, 1, 20, 1));
        scroll.setBackground(Color.DARK_GRAY);

        JRadioButton riskBtn = new JRadioButton("Emergency Alerts");
        riskBtn.setBackground(Color.DARK_GRAY);
        riskBtn.setForeground(Color.WHITE);
        JRadioButton inactiveTUBtn = new JRadioButton("Inactive Transport Units");
        inactiveTUBtn.setBackground(Color.DARK_GRAY);
        inactiveTUBtn.setForeground(Color.WHITE);
        JRadioButton allResourcesBtn = new JRadioButton("All Resources");
        allResourcesBtn.setBackground(Color.DARK_GRAY);
        allResourcesBtn.setForeground(Color.WHITE);
        JRadioButton reportBtn = new JRadioButton("Usage Report");
        reportBtn.setBackground(Color.DARK_GRAY);
        reportBtn.setForeground(Color.WHITE);
        JRadioButton totalOutputRate = new JRadioButton("Total Output Rate");
        totalOutputRate.setBackground(Color.DARK_GRAY);
        totalOutputRate.setForeground(Color.WHITE);
        ButtonGroup group = new ButtonGroup();
        group.add(riskBtn);
        group.add(inactiveTUBtn);
        group.add(allResourcesBtn);
        group.add(reportBtn);
        group.add(totalOutputRate);

        JPanel p5 = new JPanel();
        p5.setLayout(new BoxLayout(p5, BoxLayout.Y_AXIS));
        p5.setBackground(Color.DARK_GRAY);
        p5.add(allResourcesBtn);
        p5.add(riskBtn);
        p5.add(inactiveTUBtn);
        p5.add(reportBtn);
        p5.add(totalOutputRate);

        JPanel center = new JPanel();
        center.setLayout(new BorderLayout());
        center.setBackground(Color.DARK_GRAY);
        center.add(scroll, BorderLayout.CENTER);
        center.add(p5, BorderLayout.SOUTH);
        center.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JPanel east = new JPanel();
        east.setLayout(new BorderLayout());
        east.add(eastA, BorderLayout.NORTH);
        east.add(eastB, BorderLayout.CENTER);

        riskBtn.addActionListener(e -> {
            displayCenter.setText("");

            ArrayList<PowerStation> riskStations = PowerStation.atRiskStations();

            displayCenter.append("Power Stations at Outage Risk: " + riskStations.size() + "\n");

            for (PowerStation station : riskStations) {
                displayCenter.append(station.sendEmergencyAlert() + "\n");
            }
            
        });

        inactiveTUBtn.addActionListener(e -> {
            displayCenter.setText("");

            ArrayList<TransportUnit> tUnits = TransportUnit.inactiveUnits();

            displayCenter.append("Inactive Transport Units: " + tUnits.size() + "\n");
            for (TransportUnit unit : tUnits) {
                displayCenter.append(unit.toString() + "\n");
            }

        });

        allResourcesBtn.addActionListener(e -> {
            // displayCenter.setText("");

            // ArrayList<CityResource> resources = CityResource.repoResources.displayAll(CityResource.class);

            // displayCenter.append("No. of All City Resources: " + resources.size() + "\n");
            // for (CityResource resource : resources) {
            //     displayCenter.append(resource.toString() + "\n");
            // }
            String zoneName =new Scanner(System.in).nextLine();
            ArrayList<CityResource> c=CityResource.repoResources.selectByLocation(zoneName);
            displayCenter.setText("");

            displayCenter.append("The resourses at location are" + zoneName);

            for (CityResource b : c) 
                displayCenter.append(b.toString());
            
            

        });

        reportBtn.addActionListener(e -> {
            displayCenter.setText("");

            ArrayList<CityResource> resources = CityResource.repoResources.displayAll(CityResource.class);

            displayCenter.append("Usage Report of Resources: ");
            for (CityResource resource : resources) {
                displayCenter.append(resource.generateUsageReport() + "\n");
            }
        });

        totalOutputRate.addActionListener(e -> {
            displayCenter.setText("");
            displayCenter.append("Total Output Rate of All Power Plants: " + PowerStation.getTotalOutputRate() + " KWH");
        });

        JLabel footer = new JLabel("© 2025 SmartCityMS. All Rights Reserved.", SwingConstants.CENTER);
        footer.setFont(new Font("SansSerif", Font.ITALIC, 14));
        footer.setBorder(BorderFactory.createEmptyBorder(30, 10, 30, 10));
        footer.setBackground(Color.LIGHT_GRAY);
        footer.setOpaque(true);

        add(header, BorderLayout.NORTH);
        add(center, BorderLayout.CENTER);
        add(west, BorderLayout.WEST);
        add(east, BorderLayout.EAST);
        add(footer, BorderLayout.SOUTH);
        setVisible(true);
    }
}
// class LocationFrame extends JFrame{
//     public LocationFrame(){
//         setTitle("Add New City Zone");
//         setSize(500, 250);
//         setLocationRelativeTo(null);
//         setLayout(new BorderLayout());

//         JPanel inputPanel = new JPanel();
//         inputPanel.setLayout(new GridLayout(2, 2, 10, 10));
//         inputPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

//         JTextField zoneNameField = new JTextField();

//         inputPanel.add(new JLabel("Location Name:"));
//         inputPanel.add(zoneNameField);
        

//         JButton addZoneBtn = new JButton("Search by Location");

//         JPanel buttonPanel = new JPanel();
//         buttonPanel.setBorder(BorderFactory.createEmptyBorder(0, 20, 20, 20));
//         buttonPanel.add(addZoneBtn);
//         addZoneBtn.addActionListener(e -> {

//             String zoneName = zoneNameField.getText();
//             ArrayList<CityResource> c=CityResource.repoResources.selectByLocation(zoneName);
//             displayCenter.setText("");

//             ArrayList<PowerStation> riskStations = PowerStation.atRiskStations();

//             displayCenter.append("Power Stations at Outage Risk: " + riskStations.size() + "\n");

//             for (PowerStation station : riskStations) {
//                 displayCenter.append(station.sendEmergencyAlert() + "\n");
//             }



//     }

// }

class AddCityZoneFrame extends JFrame {

    public AddCityZoneFrame() {

        setTitle("Add New City Zone");
        setSize(500, 250);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new GridLayout(2, 2, 10, 10));
        inputPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextField zoneNameField = new JTextField();
        JTextField zoneIdField = new JTextField();

        inputPanel.add(new JLabel("Zone Name:"));
        inputPanel.add(zoneNameField);
        inputPanel.add(new JLabel("Zone ID:"));
        inputPanel.add(zoneIdField);

        JButton addZoneBtn = new JButton("Add City Zone");

        JPanel buttonPanel = new JPanel();
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(0, 20, 20, 20));
        buttonPanel.add(addZoneBtn);

        addZoneBtn.addActionListener(e -> {

            String zoneName = zoneNameField.getText();
            String zoneId = zoneIdField.getText();

            if (zoneName.isEmpty() || zoneId.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Both Zone Name and Zone ID must be filled out.", "Input Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            if (CityZone.isZoneIdUnique(zoneId)) {
                CityZone newZone = new CityZone(zoneName, zoneId);
                CityZone.allCityZones.add(newZone);
                JOptionPane.showMessageDialog(this, "City Zone Added Successfully!");
                dispose();
            }
            else {
                JOptionPane.showMessageDialog(this, "Error! Zone ID '" + zoneId + "' Already Exists!\nPlease enter a unique ID.", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                zoneIdField.setText("");
                zoneIdField.requestFocus();
            }

        });

        add(inputPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
        setVisible(true);
    }

}

class AddResourceHubFrame extends JFrame {

    public AddResourceHubFrame() {
        setTitle("Add New Resource Hub");
        setSize(500, 250);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new GridLayout(3, 2, 10, 10));
        inputPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextField hubIdField = new JTextField();
        JTextField hubNameField = new JTextField();

        JComboBox<String> zoneIdComboBox = new JComboBox<>();
        for (CityZone zone : CityZone.allCityZones) {
            zoneIdComboBox.addItem(zone.getZoneId());
        }

        inputPanel.add(new JLabel("Hub ID:"));
        inputPanel.add(hubIdField);
        inputPanel.add(new JLabel("Hub Name:"));
        inputPanel.add(hubNameField);
        inputPanel.add(new JLabel("Assign to Zone ID:"));
        inputPanel.add(zoneIdComboBox);

        JButton addHubBtn = new JButton("Add Resource Hub");

        JPanel buttonPanel = new JPanel();
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(0, 20, 20, 20));
        buttonPanel.add(addHubBtn);

        addHubBtn.addActionListener(e -> {
            String hubId = hubIdField.getText();
            String hubName = hubNameField.getText();
            String selectedZoneId = (String) zoneIdComboBox.getSelectedItem();

            if (hubId.isEmpty() || hubName.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Hub ID and Hub Name cannot be empty.", "Input Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            if (selectedZoneId == null) {
                JOptionPane.showMessageDialog(this, "You must select a Zone ID. Please create a City Zone first if none exist.", "Input Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            if (ResourceHub.isHubIdUnique(hubId)) {

                ResourceHub newHub = new ResourceHub(hubId, hubName, selectedZoneId);
                ResourceHub.addHub(newHub);

                for (CityZone zone : CityZone.allCityZones) {
                    if (zone.getZoneId().equals(selectedZoneId)) {
                        zone.addResourceHub(newHub);
                        break;
                    }
                }
                JOptionPane.showMessageDialog(this, "Resource Hub Added Successfully to Zone " + selectedZoneId);
                dispose();

            }
            else {
                JOptionPane.showMessageDialog(this, "Error! Hub ID '" + hubId + "' Already Exists!\nPlease enter a unique ID.", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                hubIdField.setText("");
                hubIdField.requestFocus();
            }

        });

        add(inputPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
        setVisible(true);

    }
}

class AddGridFrame extends JFrame{

    public AddGridFrame() {

        setTitle("Add New Smart Grid");
        setSize(500, 250);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new GridLayout(2, 2, 10, 10));
        inputPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JTextField gridNameField = new JTextField();
        JTextField gridIdField = new JTextField();

        inputPanel.add(new JLabel("Grid Name:"));
        inputPanel.add(gridNameField);
        inputPanel.add(new JLabel("Grid ID:"));
        inputPanel.add(gridIdField);

        JButton addGridBtn = new JButton("Add Smart Grid");

        JPanel buttonPanel = new JPanel();
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(0, 20, 20, 20));
        buttonPanel.add(addGridBtn);

        addGridBtn.addActionListener(e -> {

            String gridName = gridNameField.getText();
            String gridId = gridIdField.getText();

            if (gridName.isEmpty() || gridId.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Both Zone Name and Zone ID must be filled out.", "Input Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            boolean exist = false;
            for (SmartGrid existingGrid : PowerStation.allSmartGrids) {

                if (existingGrid.getGridId().equalsIgnoreCase(gridId)) {
                    exist = true;
                    break;
                }
            }

            if(!exist){
                SmartGrid newGrid = new SmartGrid(gridId, gridName);
                PowerStation.allSmartGrids.add(newGrid);
                JOptionPane.showMessageDialog(this, "Smart Grid '" + gridName + "' added successfully!");
                dispose();
            }
            else{
                JOptionPane.showMessageDialog(this, "Error! Smart Grid with ID '" + gridId + "' already exists.", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                gridIdField.setText("");
                gridIdField.requestFocus();
            }
            
            

        });

        add(inputPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
        setVisible(true);
    }

}

class AddBusFrame extends JFrame {

    public AddBusFrame() {

        setTitle("Add New Bus");
        setSize(600, 450);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(7, 2, 10, 10));

        JTextField hubIdField = new JTextField();
        JTextField idField = new JTextField();
        String[] cities = {"Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"};
        JComboBox<String> locField = new JComboBox<>(cities);
        String[] statuses = {"Active", "Inactive"};
        JComboBox<String> statusField = new JComboBox<>(statuses);
        JTextField passField = new JTextField();
        JTextField fuelField = new JTextField();
        JTextField distField = new JTextField();

        JButton btn = new JButton("Add Bus");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("Hub ID:"));
        p1.add(hubIdField);
        p1.add(new JLabel("Location:"));
        p1.add(locField);
        p1.add(new JLabel("Status:"));
        p1.add(statusField);
        p1.add(new JLabel("Passenger Count:"));
        p1.add(passField);
        p1.add(new JLabel("Fuel Cost:"));
        p1.add(fuelField);
        p1.add(new JLabel("Distance:"));
        p1.add(distField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        btn.addActionListener(e -> {
            String id = idField.getText();
            String hubId = hubIdField.getText();
            String loc = (String) locField.getSelectedItem();
            String st = (String) statusField.getSelectedItem();
            String zoneId;

            if (!ResourceHub.hubExists(hubId)) {
                JOptionPane.showMessageDialog(this, "Error! Hub ID '" + hubId + "' does not exist.\nPlease enter a valid Hub ID.", "Invalid Hub ID", JOptionPane.ERROR_MESSAGE);
                hubIdField.requestFocus();
                return;
            }
            else{
                zoneId = ResourceHub.getZoneId(hubId);
            }

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                JOptionPane.showMessageDialog(this, "Error! Bus ID '" + id + "' Already Exists!\nPlease enter a unique ID.", "Duplicate Resource ID", JOptionPane.ERROR_MESSAGE);
                idField.setText("");
                idField.requestFocus();
                return;
            }

            try {
                int pCount = Integer.parseInt(passField.getText());
                double fCost = Double.parseDouble(fuelField.getText());
                double dist = Double.parseDouble(distField.getText());
                new Bus(id, loc, st, hubId, zoneId, pCount, fCost, dist);
                JOptionPane.showMessageDialog(this, "Bus Added Successfully to Hub " + hubId + "!");
                dispose();

            } 
            catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Error! Please enter valid numbers for passenger count, fuel, and distance.", "Invalid Number", JOptionPane.ERROR_MESSAGE);
            }
        });

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class AddTrainFrame extends JFrame {

    public AddTrainFrame() {

        setTitle("Add New Train");
        setSize(600, 450);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(7, 2, 10, 10));

        JTextField hubIdField = new JTextField();
        JTextField idField = new JTextField();
        String[] cities = {"Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"};
        JComboBox<String> locField = new JComboBox<>(cities);
        String[] statuses = {"Active", "Inactive"};
        JComboBox<String> statusField = new JComboBox<>(statuses);
        JTextField passField = new JTextField();
        JTextField fuelField = new JTextField();
        JTextField distField = new JTextField();

        JButton btn = new JButton("Add Train");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("Hub ID:"));
        p1.add(hubIdField);
        p1.add(new JLabel("Location:"));
        p1.add(locField);
        p1.add(new JLabel("Status:"));
        p1.add(statusField);
        p1.add(new JLabel("Passenger Count:"));
        p1.add(passField);
        p1.add(new JLabel("Fuel Cost:"));
        p1.add(fuelField);
        p1.add(new JLabel("Distance:"));
        p1.add(distField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        btn.addActionListener(e -> {

            String id = idField.getText();
            String hubId = hubIdField.getText();
            String loc = (String) locField.getSelectedItem();
            String st = (String) statusField.getSelectedItem();
            String zoneId;

            if (!ResourceHub.hubExists(hubId)) {
                JOptionPane.showMessageDialog(this, "Error! Hub ID '" + hubId + "' does not exist.", "Invalid Hub ID", JOptionPane.ERROR_MESSAGE);
                hubIdField.requestFocus();
                return;
            }
            else{
                zoneId = ResourceHub.getZoneId(hubId);
            }

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                JOptionPane.showMessageDialog(this, "Error! Train ID Already Exists!", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                idField.requestFocus();
                return;
            }

            try {
                int pCount = Integer.parseInt(passField.getText());
                double fCost = Double.parseDouble(fuelField.getText());
                double dist = Double.parseDouble(distField.getText());
                new Train(id, loc, st, hubId, zoneId, pCount, fCost, dist);
                JOptionPane.showMessageDialog(this, "Train Added Successfully to Hub " + hubId + "!");
                dispose();
            }
            catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Error! Please enter valid numbers for passenger count, fuel, and distance.", "Invalid Number", JOptionPane.ERROR_MESSAGE);
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class AddPowerStationFrame extends JFrame {

    public AddPowerStationFrame() {

        setTitle("Add New Power Station");
        setSize(600, 450);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(8, 2, 10, 10));

        JTextField gridIdField = new JTextField();
        JTextField hubIdField = new JTextField();
        JTextField idField = new JTextField();
        String[] cities = {"Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"};
        JComboBox<String> locField = new JComboBox<>(cities);
        String[] statuses = {"Active", "Inactive"};
        JComboBox<String> statusField = new JComboBox<>(statuses);
        JTextField outputRateField = new JTextField();
        JTextField costField = new JTextField();
        String[] risks = {"Yes", "No"};
        JComboBox<String> outageRiskField = new JComboBox<>(risks);

        JButton btn = new JButton("Add Power Station");

        p1.add(new JLabel("Grid ID:"));
        p1.add(gridIdField);
        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("Hub ID:"));
        p1.add(hubIdField);
        p1.add(new JLabel("Location:"));
        p1.add(locField);
        p1.add(new JLabel("Status:"));
        p1.add(statusField);
        p1.add(new JLabel("Output Rate:"));
        p1.add(outputRateField);
        p1.add(new JLabel("Cost Per Hour:"));
        p1.add(costField);
        p1.add(new JLabel("Outage Risk(Yes/No):"));
        p1.add(outageRiskField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        btn.addActionListener(e -> {

            String id = idField.getText();
            String gridId = gridIdField.getText();
            String hubId = hubIdField.getText();
            String loc = (String) locField.getSelectedItem();
            String st = (String) statusField.getSelectedItem();
            String rsk = (String) outageRiskField.getSelectedItem();
            boolean risk = rsk.equalsIgnoreCase("yes");
            String zoneId;

            SmartGrid exists = null;
            for (SmartGrid grid : PowerStation.allSmartGrids) {
                if (grid.getGridId().equalsIgnoreCase(gridId)) {
                    exists = grid;
                    break;
                }
            }

            if (exists == null) {
                JOptionPane.showMessageDialog(this, "Error! Smart Grid with ID '" + gridId + "' does not exist.", "Grid Not Found", JOptionPane.ERROR_MESSAGE);
                gridIdField.requestFocus();
                return;
            }

            if (!ResourceHub.hubExists(hubId)) {
                JOptionPane.showMessageDialog(this, "Error! Hub ID '" + hubId + "' does not exist.", "Invalid Hub ID", JOptionPane.ERROR_MESSAGE);
                hubIdField.requestFocus();
                return;
            }
            else{
                zoneId = ResourceHub.getZoneId(hubId);
            }

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                JOptionPane.showMessageDialog(this, "Error! Power Station ID Already Exists!", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                idField.requestFocus();
                return;
            }

            try {
                double output = Double.parseDouble(outputRateField.getText());
                double cost = Double.parseDouble(costField.getText());
                PowerStation p = new PowerStation(id, loc, st, hubId, zoneId, gridId, output, cost, risk);
                exists.addPowerStation(p);
                JOptionPane.showMessageDialog(this, "Power Station Added Successfully to Hub " + hubId + "!");
                dispose();
            }
            catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Error! Please enter valid numbers for output and cost.", "Invalid Number", JOptionPane.ERROR_MESSAGE);
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class AddEmergencyServiceFrame extends JFrame {

    public AddEmergencyServiceFrame() {

        setTitle("Add New Emergency Service");
        setSize(600, 500);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(8, 2, 10, 10));

        JTextField hubIdField = new JTextField();
        JTextField idField = new JTextField();
        String[] cities = {"Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta"};
        JComboBox<String> locField = new JComboBox<>(cities);
        String[] statuses = {"Active", "Inactive"};
        JComboBox<String> statusField = new JComboBox<>(statuses);
        String[] types = {"Police", "Rescue", "Fire Brigade"};
        JComboBox<String> typeField = new JComboBox<>(types);
        JTextField costField = new JTextField();
        JTextField empField = new JTextField();
        JTextField eqField = new JTextField();

        JButton btn = new JButton("Add Emergency Service");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("Hub ID:"));
        p1.add(hubIdField);
        p1.add(new JLabel("Location:"));
        p1.add(locField);
        p1.add(new JLabel("Status:"));
        p1.add(statusField);
        p1.add(new JLabel("Type:"));
        p1.add(typeField);
        p1.add(new JLabel("No. Of Employees:"));
        p1.add(empField);
        p1.add(new JLabel("No. Of Equipments:"));
        p1.add(eqField);
        p1.add(new JLabel("Cost Per Entity:"));
        p1.add(costField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        btn.addActionListener(e -> {

            String id = idField.getText();
            String hubId = hubIdField.getText();
            String loc = (String) locField.getSelectedItem();
            String st = (String) statusField.getSelectedItem();
            String type = (String) typeField.getSelectedItem();
            String zoneId;

            if (!ResourceHub.hubExists(hubId)) {
                JOptionPane.showMessageDialog(this, "Error! Hub ID '" + hubId + "' does not exist.", "Invalid Hub ID", JOptionPane.ERROR_MESSAGE);
                hubIdField.requestFocus();
                return;
            }
            else{
                zoneId = ResourceHub.getZoneId(hubId);
            }

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                JOptionPane.showMessageDialog(this, "Error! Emergency Service ID Already Exists!", "Duplicate ID", JOptionPane.ERROR_MESSAGE);
                idField.requestFocus();
                return;
            }

            try {
                int empCount = Integer.parseInt(empField.getText());
                int eqCount = Integer.parseInt(eqField.getText());
                double cost = Double.parseDouble(costField.getText());
                new EmergencyService(id, loc, st, hubId, zoneId, type, empCount, eqCount, cost);
                JOptionPane.showMessageDialog(this, "Emergency Service Added Successfully to Hub " + hubId + "!");
                dispose();
            }
            catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Error! Please enter valid numbers for employees, equipment, and cost.", "Invalid Number", JOptionPane.ERROR_MESSAGE);
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class UpdateStatusFrame extends JFrame {

    public UpdateStatusFrame() {

        setTitle("Update Resource Status");
        setSize(500, 200);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(2, 2, 10, 10));

        JTextField idField = new JTextField();
        String[] statuses = {"Active", "Inactive"};
        JComboBox<String> statusField = new JComboBox<>(statuses);

        JButton btn = new JButton("Update Status");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("New Status:"));
        p1.add(statusField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        btn.addActionListener(e -> {

            String id = idField.getText();
            String st = (String) statusField.getSelectedItem();

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                CityResource.updateStatus(id, st);
                JOptionPane.showMessageDialog(this, "Resource Status Updated Successfully!");
                dispose();
            }
            else {
                JOptionPane.showMessageDialog(this, "Error! Resource ID Does Not Exist!", "Missing ID", JOptionPane.ERROR_MESSAGE);
                idField.setText("");
                idField.requestFocus();
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class UpdateRiskStatusFrame extends JFrame {

    public UpdateRiskStatusFrame() {

        setTitle("Update Power Station's OutageRisk Status");
        setSize(500, 200);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(2, 2, 10, 10));

        JTextField idField = new JTextField();
        String[] statuses = {"Yes", "No"};
        JComboBox<String> statusField = new JComboBox<>(statuses);
        JButton btn = new JButton("Update Status");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);
        p1.add(new JLabel("Updated Outage Risk:"));
        p1.add(statusField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);

        btn.addActionListener(e -> {
            String id = idField.getText();
            String st = (String) statusField.getSelectedItem();
            
            if (CityResource.repoResources.getResourceByID(id, PowerStation.class) != null) {
                PowerStation.updateRisk(id, st);
                JOptionPane.showMessageDialog(this, "Resource Risk Status Updated Successfully!");
                dispose();
            }
            else{
                JOptionPane.showMessageDialog(this, "Error! Power Station ID Does Not Exist!", "Missing ID", JOptionPane.ERROR_MESSAGE);
                idField.setText("");
                idField.requestFocus();
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class DeleteResourceFrame extends JFrame {

    public DeleteResourceFrame() {

        setTitle("Delete Resource");
        setSize(400, 150);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(1, 2, 10, 10));

        JTextField idField = new JTextField();
        JButton btn = new JButton("Delete Resource");

        p1.add(new JLabel("Resource ID:"));
        p1.add(idField);

        JPanel p2 = new JPanel();
        p2.setBorder(BorderFactory.createEmptyBorder(10, 20, 20, 20));
        p2.add(btn);

        add(p2, BorderLayout.SOUTH);
        
        btn.addActionListener(e -> {
            String id = idField.getText();

            if (CityResource.repoResources.getResourceByID(id, CityResource.class) != null) {
                CityResource.repoResources.removeResource(id);
                JOptionPane.showMessageDialog(this, "Resource Deleted Successfully!");
                dispose();
            }
            else{
                JOptionPane.showMessageDialog(this, "Error! Resource ID Does Not Exist!", "Missing ID", JOptionPane.ERROR_MESSAGE);
                idField.setText("");
                idField.requestFocus();
            }

        });

        p1.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        add(p1, BorderLayout.CENTER);
        setVisible(true);
    }
}

class PublicPanel extends JFrame {

    public PublicPanel() {

        setTitle("Public View");
        setSize(1200, 800);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout(10, 10));
        getContentPane().setBackground(Color.DARK_GRAY);

        JLabel header = new JLabel("Smart City Management System - Public Information Portal", SwingConstants.CENTER);
        header.setFont(new Font("Arial", Font.BOLD, 30));
        header.setBorder(BorderFactory.createEmptyBorder(50, 10, 50, 10));
        header.setBackground(Color.BLACK);
        header.setForeground(Color.WHITE);
        header.setOpaque(true);

        add(header, BorderLayout.NORTH);

        JTextArea displayArea = new JTextArea();
        displayArea.setFont(new Font("Monospaced", Font.PLAIN, 14));
        displayArea.setEditable(false);
        displayArea.setMargin(new Insets(10, 10, 10, 10));
        displayArea.setBackground(Color.BLACK);
        displayArea.setForeground(Color.WHITE);

        JScrollPane scrollPane = new JScrollPane(displayArea);
        scrollPane.setBackground(Color.DARK_GRAY);
        add(scrollPane, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridLayout(8, 1, 10, 10));
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        buttonPanel.setBackground(Color.DARK_GRAY);

        JButton viewAllBtn = new JButton("View All Resources");
        viewAllBtn.setPreferredSize(new Dimension(250, 30));
        viewAllBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        viewAllBtn.setBackground(Color.BLACK);
        viewAllBtn.setForeground(Color.CYAN);

        JButton viewBusesBtn = new JButton("View All Buses");
        viewBusesBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        viewBusesBtn.setBackground(Color.BLACK);
        viewBusesBtn.setForeground(Color.CYAN);

        JButton viewTrainsBtn = new JButton("View All Trains");
        viewTrainsBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        viewTrainsBtn.setBackground(Color.BLACK);
        viewTrainsBtn.setForeground(Color.CYAN);

        JButton viewPowerStationsBtn = new JButton("View Power Stations");
        viewPowerStationsBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        viewPowerStationsBtn.setBackground(Color.BLACK);
        viewPowerStationsBtn.setForeground(Color.CYAN);

        JButton viewEmergencyServicesBtn = new JButton("View Emergency Services");
        viewEmergencyServicesBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        viewEmergencyServicesBtn.setBackground(Color.BLACK);
        viewEmergencyServicesBtn.setForeground(Color.CYAN);

        JButton reportBtn = new JButton("Usage Report");
        reportBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        reportBtn.setBackground(Color.BLACK);
        reportBtn.setForeground(Color.CYAN);

        JButton riskBtn = new JButton("Emergency Alert");
        riskBtn.setBorder(BorderFactory.createLineBorder(Color.GRAY, 2));
        riskBtn.setBackground(Color.BLACK);
        riskBtn.setForeground(Color.CYAN);

        JButton backBtn = new JButton("<< Back to Main");
        backBtn.setBorder(BorderFactory.createLineBorder(Color.BLACK, 3));
        backBtn.setBackground(Color.LIGHT_GRAY);
        backBtn.setForeground(new Color(220, 53, 69));

        Font buttonFont = new Font("Arial", Font.BOLD, 14);
        viewAllBtn.setFont(buttonFont);
        viewBusesBtn.setFont(buttonFont);
        viewTrainsBtn.setFont(buttonFont);
        viewPowerStationsBtn.setFont(buttonFont);
        viewEmergencyServicesBtn.setFont(buttonFont);
        reportBtn.setFont(buttonFont);
        riskBtn.setFont(buttonFont);
        backBtn.setFont(buttonFont);


        buttonPanel.add(viewAllBtn);
        buttonPanel.add(viewBusesBtn);
        buttonPanel.add(viewTrainsBtn);
        buttonPanel.add(viewPowerStationsBtn);
        buttonPanel.add(viewEmergencyServicesBtn);
        buttonPanel.add(reportBtn);
        buttonPanel.add(riskBtn);
        buttonPanel.add(backBtn);

        add(buttonPanel, BorderLayout.WEST);

        JLabel footer = new JLabel("© 2025 SmartCityMS. All Rights Reserved.", SwingConstants.CENTER);
        footer.setFont(new Font("SansSerif", Font.ITALIC, 14));
        footer.setBorder(BorderFactory.createEmptyBorder(30, 10, 30, 10));
        footer.setBackground(Color.LIGHT_GRAY);
        footer.setOpaque(true);

        add(footer, BorderLayout.SOUTH);

        viewAllBtn.addActionListener(e -> {

            displayArea.setText("");
            ArrayList<CityResource> resources = CityResource.repoResources.displayAll(CityResource.class);
            displayArea.append("--- All City Resources (" + resources.size() + ") ---\n");

            if (resources.isEmpty()) {
                displayArea.append("\nNo resources found in the system.");
            }
            else{

                for (CityResource resource : resources) {
                    displayArea.append(resource.toString() + "\n--------------------\n");
                }
            }

        });

        viewBusesBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<Bus> buses = CityResource.repoResources.displayAll(Bus.class);

            displayArea.append("--- Available Buses (" + buses.size() + ") ---\n");

            if (buses.isEmpty()) {
                displayArea.append("\nNo buses found.");
            }
            else {
                for (Bus bus : buses) {
                    displayArea.append(bus.toString() + "\n" + bus.generateUsageReport() + "\n--------------------\n");
                }
            }

        });

        viewTrainsBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<Train> trains = CityResource.repoResources.displayAll(Train.class);
            displayArea.append("--- Available Trains (" + trains.size() + ") ---\n");

            if (trains.isEmpty()) {
                displayArea.append("\nNo trains found.");
            }
            else {
                for (Train train : trains) {
                    displayArea.append(train.toString() + "\n" + train.generateUsageReport() + "\n--------------------\n");
                }
            }

        });

        viewPowerStationsBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<PowerStation> stations = CityResource.repoResources.displayAll(PowerStation.class);
            displayArea.append("--- Power Stations (" + stations.size() + ") ---\n");

            if (stations.isEmpty()) {
                displayArea.append("\nNo power stations found.");
            }
            else {
                for (PowerStation station : stations) {
                    displayArea.append(station.toString() + "\n" + station.sendEmergencyAlert() + "\n--------------------\n");
                }
            }

        });

        viewEmergencyServicesBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<EmergencyService> services = CityResource.repoResources.displayAll(EmergencyService.class);
            displayArea.append("--- Emergency Services (" + services.size() + ") ---\n");

            if (services.isEmpty()) {
                displayArea.append("\nNo emergency services found.");
            }
            else {
                for (EmergencyService service : services) {
                    displayArea.append(service.toString() + "\n--------------------\n");
                }
            }

        });

        reportBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<CityResource> resources = CityResource.repoResources.displayAll(CityResource.class);

            displayArea.append("Usage Report of Resources: ");
            for (CityResource resource : resources) {
                displayArea.append(resource.generateUsageReport() + "\n");
            }
        });

        riskBtn.addActionListener(e -> {
            displayArea.setText("");

            ArrayList<PowerStation> riskStations = PowerStation.atRiskStations();

            displayArea.append("Power Stations at Outage Risk: " + riskStations.size() + "\n");

            for (PowerStation station : riskStations) {
                displayArea.append(station.sendEmergencyAlert() + "\n");
            }
            
        });

        backBtn.addActionListener(e -> {
            new SmartCityMS();
            dispose();
        });

        setVisible(true);
    }
}