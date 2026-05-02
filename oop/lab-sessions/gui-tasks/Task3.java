import java.awt.*;
import javax.swing.*;

class GridLayoutDemo extends JFrame {
    GridLayoutDemo() {
        setTitle("GridLayout Demo");
        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        setLayout(new GridLayout(2, 3, 10, 10));

        add(new JButton("one"));
        add(new JButton("two"));
        add(new JButton("three"));
        add(new JButton("four"));
        add(new JButton("five"));
        add(new JButton("six"));
    }
}

public class Task3 {
    public static void main(String[] args) {
            new GridLayoutDemo().setVisible(true);
    }
}
