import java.awt.*;
import javax.swing.*;

class Layout extends JFrame {
    Layout() {
        setTitle("Panel Presentation");
        setSize(500, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JPanel p1 = new JPanel();
        p1.setBackground(Color.BLUE);
        p1.setPreferredSize(new Dimension(120, 0)); 
        add(p1, BorderLayout.WEST);

        JPanel p4 = new JPanel();
        p4.setBackground(Color.WHITE);
        add(p4, BorderLayout.CENTER);

        JPanel p2 = new JPanel();
        p2.setBackground(Color.DARK_GRAY);
        p2.setPreferredSize(new Dimension(120, 0));
        add(p2, BorderLayout.EAST);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setBackground(Color.LIGHT_GRAY);
        buttonPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 10, 5));

        JButton a = new JButton("Blue");
        a.setBackground(Color.BLUE);

        JButton b = new JButton("White");
        b.setBackground(Color.WHITE);

        JButton c = new JButton("Gray");
        c.setBackground(Color.GRAY);

        buttonPanel.add(a);
        buttonPanel.add(b);
        buttonPanel.add(c);

        add(buttonPanel, BorderLayout.SOUTH);
    }
}

public class Task2 {
    public static void main(String[] args) {
            Layout frame = new Layout();
            frame.setVisible(true);
    }
}
