import java.awt.*;
import javax.swing.*;

class PanelDemo extends JFrame {
    PanelDemo() {
        setTitle("Panel Demo");
        setSize(600, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel centerPanel = new JPanel();
        centerPanel.setBackground(Color.LIGHT_GRAY);
        add(centerPanel, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new FlowLayout());

        for (int i = 1; i <= 5; i++) {
            buttonPanel.add(new JButton("Button " + i));
        }

        add(buttonPanel, BorderLayout.SOUTH);
    }
}

public class Task4 {
    public static void main(String[] args) {
            new PanelDemo().setVisible(true);
    }
}

