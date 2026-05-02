
import java.awt.*;
import javax.swing.*;

class Data extends JFrame{
    public Data(){
        String [] arr ={
            "7" , "8" , "9" , "/",
            "4" , "5" , "6" , "*",
            "1" , "2" , "3" , "-",
            "0" , "." , "=" , "+"
        };
        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(4, 4)); 
        for (int i = 0; i <arr.length; i++) { 
            p1.add(new JButton(arr[i])); 
        }
        JTextField t = new JTextField();
        add(p1, BorderLayout.CENTER);
        add(t, BorderLayout.NORTH,100);
    }
}
class Calculator {
    public static void main(String[] args) { 
        Data frame = new Data(); 
        frame.setTitle("Calculator"); 
        frame.setSize(400, 250); 
        frame.setLocationRelativeTo(null); 
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); 
        frame.setVisible(true);
    }
}
