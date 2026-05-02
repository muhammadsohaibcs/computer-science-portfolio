import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

class RadioButtonDemo extends JFrame {
    private JTextField textField;
    private JRadioButton plain;
    private JRadioButton bold;
    private JRadioButton italic;
    private JRadioButton boldItalic;

    RadioButtonDemo() {
        setTitle("RadioButton Test");
        setSize(300, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        setLayout(new FlowLayout());

        textField = new JTextField("Watch the font style change", 15);
        textField.setFont(new Font("Arial", Font.PLAIN, 14));

        plain = new JRadioButton("Plain", true);
        bold = new JRadioButton("Bold");
        italic = new JRadioButton("Italic");
        boldItalic = new JRadioButton("Bold Italic");

        ButtonGroup group = new ButtonGroup();
        group.add(plain);
        group.add(bold);
        group.add(italic);
        group.add(boldItalic);

        RadioButtonHandler handler = new RadioButtonHandler();
        plain.addItemListener(handler);
        bold.addItemListener(handler);
        italic.addItemListener(handler);
        boldItalic.addItemListener(handler);

        add(textField);
        add(plain);
        add(bold);
        add(italic);
        add(boldItalic);
    }
    private class RadioButtonHandler implements ItemListener {
        public void itemStateChanged(ItemEvent event) {
            Font font = null; // Stores the new Font

            if (plain.isSelected()) {
                font = new Font("Serif", Font.PLAIN, 14);
            } else if (bold.isSelected()) {
                font = new Font("Serif", Font.BOLD, 14);
            } else if (italic.isSelected()) {
                font = new Font("Serif", Font.ITALIC, 14);
            } else if (boldItalic.isSelected()) {
                font = new Font("Serif", Font.BOLD + Font.ITALIC, 14);
            }

            textField.setFont(font); 
        }
    }
}

public class Task7 {
    public static void main(String[] args) {
        new RadioButtonDemo().setVisible(true);
    }
}
