import java.awt.*;
import javax.swing.*;

class ScrollBarsDemo extends JFrame {
    ScrollBarsDemo() {
        setTitle("Scroll Bars Demo");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JTextArea textArea = new JTextArea();

        JScrollPane scrollPane = new JScrollPane(textArea);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(new JButton("Save Memo 1"));
        buttonPanel.add(new JButton("Save Memo 2"));
        buttonPanel.add(new JButton("Clear"));
        buttonPanel.add(new JButton("Get Memo 1"));
        buttonPanel.add(new JButton("Get Memo 2"));

        setLayout(new BorderLayout());
        add(scrollPane, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
    }
}

public class Task5 {
    public static void main(String[] args) {
        new ScrollBarsDemo().setVisible(true);
    }
}
