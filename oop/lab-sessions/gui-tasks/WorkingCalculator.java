import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

class Data extends JFrame {
    private JTextField display;
    private double result = 0;
    private String lastOperator = "+";
    private final double[] operand = {0};

    public Data() {
        String[] arr = {
            "7", "8", "9", "/",
            "4", "5", "6", "*",
            "1", "2", "3", "-",
            "0", ".", "=", "+"
        };

        JPanel p1 = new JPanel();
        p1.setLayout(new GridLayout(4, 4)); 
        for (int i = 0; i < arr.length; i++) { 
            JButton button = new JButton(arr[i]);
            button.addActionListener(new ActionHandler());
            p1.add(button); 
        }

        display = new JTextField("0");
        display.setEditable(false);
        display.setHorizontalAlignment(JTextField.RIGHT);

        add(p1, BorderLayout.CENTER);
        add(display, BorderLayout.NORTH);
    }

    private class ActionHandler implements ActionListener {
        public void actionPerformed(ActionEvent event) {
            String command = event.getActionCommand();

            if (Character.isDigit(command.charAt(0)) || command.equals(".")) {
                String current = display.getText();
                if (current.equals("0") && !command.equals(".")) {
                    display.setText(command);
                } else {
                    display.setText(current + command);
                }
            } else if (command.equals("=")) {
                double value = Double.parseDouble(display.getText());
                switch (lastOperator) {
                    case "+": result += value; break;
                    case "-": result -= value; break;
                    case "*": result *= value; break;
                    case "/": result = value != 0 ? result / value : Double.NaN; break;
                }
                display.setText(String.valueOf(result == (int) result ? (int) result : result));
                if (Double.isNaN(result)) display.setText("Error");
                result = 0; 
                lastOperator = "+";
                operand[0] = 0;
            } else {
                operand[0] = Double.parseDouble(display.getText());
                switch (lastOperator) {
                    case "+": result += operand[0]; break;
                    case "-": result -= operand[0]; break;
                    case "*": result *= operand[0]; break;
                    case "/": result = operand[0] != 0 ? result / operand[0] : Double.NaN; break;
                }
                display.setText("0");
                lastOperator = command;
            }
        }
    }
}

class Task9 {
    public static void main(String[] args) { 
        Data frame = new Data(); 
        frame.setTitle("Calculator"); 
        frame.setSize(400, 250); 
        frame.setLocationRelativeTo(null); 
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); 
        frame.setVisible(true);
    }
}
