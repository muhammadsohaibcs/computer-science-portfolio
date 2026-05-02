import java.awt.*;
import javax.swing.*;
import java.awt.event.*;

class CheckBoxDemo extends JFrame {
    private JTextField textField;
    private JCheckBox boldJCheckBox;
    private JCheckBox italicJCheckBox;

    CheckBoxDemo() {
        setTitle("JCheckBox Test");
        setSize(300, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        setLayout(new FlowLayout());

        textField = new JTextField("Watch the font style change", 15);
        textField.setFont(new Font("Arial", Font.PLAIN, 14));

        boldJCheckBox = new JCheckBox("Bold");
        italicJCheckBox = new JCheckBox("Italic");

        CheckBoxHandler handler = new CheckBoxHandler();
        boldJCheckBox.addItemListener(handler);
        italicJCheckBox.addItemListener(handler);

        add(textField);
        add(boldJCheckBox);
        add(italicJCheckBox);
    }
    private class CheckBoxHandler implements ItemListener {
        public void itemStateChanged(ItemEvent event) {
            Font font = null; 

            if (boldJCheckBox.isSelected() && italicJCheckBox.isSelected()) {
                font = new Font("Serif", Font.BOLD + Font.ITALIC, 14);
            } else if (boldJCheckBox.isSelected()) {
                font = new Font("Serif", Font.BOLD, 14);
            } else if (italicJCheckBox.isSelected()) {
                font = new Font("Serif", Font.ITALIC, 14);
            } else {
                font = new Font("Serif", Font.PLAIN, 14);
            }

            textField.setFont(font); 
        }
    }
}

public class Task8 {
    public static void main(String[] args) {
        new CheckBoxDemo().setVisible(true);
    }
}
