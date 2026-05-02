import java.io.*;
import java.util.Scanner;

public class pf4 {
    static Scanner sohaib = new Scanner(System.in);

    public static void main(String[] args) {
        while (true) {
            System.out.println("\nWhat would you like to do?");
            System.out.println("1.) Hide");
            System.out.println("2.) Recover");
            System.out.println("3.) Exit");
            System.out.print("Enter your selection: ");
            String choice = sohaib.next();

            if (choice.equals("1")) {
                hidden();
            } else if (choice.equals("2")) {
                extract();
            } else if (choice.equals("3")) {
                System.out.println("You exited successfully.");
                break;
            } else {
                System.out.println("Invalid choice. Please try again.");
                continue;
            }
        }
    }

    public static void hidden() {
        try {
            // Input file
            System.out.print("Enter the source PPM file path: ");
            String sourcePath = sohaib.next();
            FileInputStream input = new FileInputStream(sourcePath);

            // Output file
            System.out.print("Enter the output PPM file path: ");
            String outputPath = sohaib.next();
            FileOutputStream output = new FileOutputStream(outputPath);

            // Read and write header
            StringBuilder headerBuilder = new StringBuilder();
            int lineCount = 0;

            while (lineCount < 3) {
                int readByte = input.read();
                if (readByte == -1) {
                    throw new IOException("Unexpected end of file while reading the header.");
                }
                char readChar = (char) readByte;
                headerBuilder.append(readChar);
                if (readChar == '\n') {
                    lineCount++;
                }
            }

            String header = headerBuilder.toString();
            output.write(header.getBytes());

            // Encode the message
            sohaib.nextLine(); // Consume leftover newline
            System.out.println("Enter the text that you want to hide: ");
            String text = sohaib.nextLine() + "\0"; // Add null terminator
            byte[] messageBytes = text.getBytes();
            int messageIndex = 0;
            int messageBitIndex = 0;

            // Process pixel data
            int pixel;
            while ((pixel = input.read()) != -1) {
                if (messageIndex < messageBytes.length) {
                    int bit = (messageBytes[messageIndex] >> (7 - messageBitIndex)) & 1;
                    pixel = (pixel & 0xFE) | bit;

                    messageBitIndex++;
                    if (messageBitIndex == 8) {
                        messageBitIndex = 0;
                        messageIndex++;
                    }
                }
                output.write(pixel);
            }

            input.close();
            output.close();

            System.out.println("Message hidden successfully in: " + outputPath);
        } catch (FileNotFoundException e) {
            System.out.println("Error: File not found. Please check the path and try again.");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void extract() {
        try {
            // Input file
            System.out.print("Enter the PPM file path to extract the message from: ");
            String sourcePath = sohaib.next();
            FileInputStream input = new FileInputStream(sourcePath);
            // Skip header
            int lineCount = 0;
            while (lineCount < 3) {
                int readByte = input.read();
                if (readByte == -1) {
                    throw new IOException("Unexpected end of file while reading the header.");
                }
                if ((char) readByte == '\n') {
                    lineCount++;
                }
            }

            // Extract hidden message
            StringBuilder messageBuilder = new StringBuilder();
            int charAccumulator = 0;
            int bitIndex = 0;
            int pixel;
            while ((pixel = input.read()) != -1) {
                int bit = pixel & 1; // Extract LSB
                charAccumulator = (charAccumulator << 1) | bit;
                bitIndex++;

                if (bitIndex == 8) { // Reconstruct character
                    if (charAccumulator == 0) break; // Stop at null terminator
                    messageBuilder.append((char) charAccumulator);
                    charAccumulator = 0;
                    bitIndex = 0;
                }
            }

            input.close();

            String hiddenMessage = messageBuilder.toString();
            System.out.println("Extracted Message: " + hiddenMessage);
        } catch (FileNotFoundException e) {
            System.out.println("Error: File not found. Please check the path and try again.");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
