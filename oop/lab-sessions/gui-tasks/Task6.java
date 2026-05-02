import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

class TextBoxDemo extends JFrame {
    private JTextField textField;
    private JButton button;

    TextBoxDemo() {
        setTitle("TextBox Demo");
        setSize(300, 150);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        setLayout(new FlowLayout());

        JLabel label = new JLabel("Enter text:");
        textField = new JTextField(15);
        button = new JButton("Display");
        
        ActionHandler handler = new ActionHandler();
        button.addActionListener(handler);

        add(label);
        add(textField);
        add(button);
    }

    private class ActionHandler implements ActionListener {
        public void actionPerformed(ActionEvent event) {
            String text = textField.getText();
            JOptionPane.showMessageDialog(TextBoxDemo.this, text, "Entered Text", JOptionPane.INFORMATION_MESSAGE);
        }
    }
}

public class Task6 {
    public static void main(String[] args) {
        new TextBoxDemo().setVisible(true);
    }
}
