import java.io.*;
import java.util.Scanner;
public class assignmentclass {
    static File file = new File ("firewall.txt");
    static Scanner soh = new Scanner (System.in);
    static int t = 0;
    static int c = 0;
    public static void main(String[] args) {
        System.out.println("Welcome to the Port Scan Database.");
        while (true){
            t=0;
            c=0;
            System.out.println("Enter IP/DP/PL/IL/END (IP address/Destination Port/Port List/IP List/END): ");
            int count = 0;
            try {
                Scanner sohaib = new Scanner (file);
                while (sohaib.hasNextLine()){
                    sohaib.nextLine();
                    count++;
                }
            } catch (Exception e) {
                System.out.println(e);
            }
            String [] ip = new String [count]; 
            String [] il = new String [count];
            String [] pl = new String [count];
            String [] dp = new String [count];
            int countip =0;
            int countil =0;
            int countpl =0;
            int countdp =0;
            try {
                Scanner sohaib = new Scanner (file);
                while (sohaib.hasNextLine()){
                    String [] b = sohaib.nextLine().split(" ");
                    for (int idx = 1; idx < b.length; idx++) {
                        if (idx==1){
                            String [] ipdp = b[idx].split(":");
                            ip[countip++]=ipdp[0];
                            il[countil++]=ipdp[1];
                        }
                        else{
                            String [] ipdp = b[idx].split(":");
                            pl[countpl++]=ipdp[0];
                            dp[countdp++]=ipdp[1];  
                        } 
                    }
                }
            } catch (Exception e) {
                System.out.println(e);
            }     
            String a = soh.nextLine();
            if (a.equalsIgnoreCase("ip"))
                ip(ip,true);
            if (a.equalsIgnoreCase("dp"))
                dp(dp,true);
            if (a.equalsIgnoreCase("pl"))
                pl(ip,dp,il);
            if (a.equalsIgnoreCase("il"))
                il(dp,ip);
            if (a.equalsIgnoreCase("end")){
                System.out.println("you exit sucessfully");
                break;
            }
        }  
    }
    public static void ip (String [] ip,boolean a){   
        try {
            if (a==true)
            System.out.println("For which IP do you wish to retrieve statistics? ");
            String search = soh.next();
            if (a==false)
            System.out.print(search);
            for (int idx = 0; idx < ip.length; idx++) {
                if (ip[idx].equalsIgnoreCase(search)){
                    c++;
                    break; 
                }
                t++;   
            }
            if (a==true)
            System.out.println("There were "+c + " probes from " + search);    
        } catch (Exception e) {
            System.out.println(e);
        }
    }
    public static void dp(String [] dp,boolean a){
        try { 
            System.out.println("For which port do you wish to retrieve statistics? ");
            String search = soh.next();
            for (int idx = 0; idx < dp.length; idx++) {
                if (dp[idx].equalsIgnoreCase(search)){
                    c++;
                    break;
                } 
                t++;      
            }
            if (a==true)
            System.out.println("There were "+c + " probes from " + search);   
        } catch (Exception e) {
            System.out.println(e);
        }
    }
    public static void pl(String [] ip,String [] dp,String [] il ){
        System.out.println("Enter a source IP address to see a list of ports that it scanned ");
        ip(ip,false);
        if (c==0)
            System.out.println("No IP found");
        else
            System.out.println(" sent a packet from port " + il[t] + " to port " +dp[t] );
    }
    public static void il(String[] dp,String [] ip){
        dp(dp,false);
        if (c==0)
            System.out.println("No port found");
        else
            System.out.println("The " + c + " different IP’s who probed port are as follows: \n"+ ip[t]);
    }
}
