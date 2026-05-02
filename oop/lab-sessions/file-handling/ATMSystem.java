import java.io.*;
import java.util.*;
class Account implements Serializable {
    int accountNumber;
    String holderName;
    double balance;

    public Account(int accountNumber, String holderName, double balance) {
        this.accountNumber = accountNumber;
        this.holderName = holderName;
        this.balance = balance;
    }
    public int getAccountNumber() {
        return accountNumber;
    }
    public double getBalance() {
        return balance;
    }
    public String getHolderName() {
        return holderName;
    }
    public void setAccountNumber(int accountNumber) {
        this.accountNumber = accountNumber;
    }
    public void setBalance(double balance) {
        this.balance = balance;
    }
    public void setHolderName(String holderName) {
        this.holderName = holderName;
    }

    public String toString() {
        return "Account{" + "Account Number=" + accountNumber +
               ", Holder='" + holderName + '\'' +
               ", Balance=" + balance + '}';
    }
}
public class ATMSystem {

    static final String FILE_NAME = "Accounts.ser";

    public static void main(String[] args) {
        if (!new File(FILE_NAME).exists()) {
            createAccounts();
        }

        Scanner sc = new Scanner(System.in);
        int choice;
        do {
            System.out.println("\n******************** ATM SYSTEM MENU ********************");
            System.out.println("1. Balance Inquiry");
            System.out.println("2. Deposit");
            System.out.println("3. Withdraw");
            System.out.println("4. Transfer");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch (choice) {
                case 1: balanceInquiry(); break;
                case 2: deposit(); break;
                case 3: withdraw(); break;
                case 4: transfer(); break;
                case 5: System.out.println("Thank you for using ATM System."); break;
                default: System.out.println("Invalid choice!");
            }
        } while (choice != 5);
    }
    public static void createAccounts() {
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            for (int i = 1; i <= 10; i++) {
                out.writeObject(new Account(1000 + i, "User" + i, 1000.0 * i));
            }
            System.out.println("10 accounts created and saved.");
        } catch (IOException e) {
            System.out.println("Error creating accounts: " + e);
        }
    }
    public static List<Account> readAccounts() {
        List<Account> accounts = new ArrayList<>();
        try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(FILE_NAME))) {
            while (true) {
                accounts.add((Account) in.readObject());
            }
        } catch (EOFException e) {
        } catch (Exception e) {
            System.out.println("Error reading accounts: " + e);
        }
        return accounts;
    }
      public static void writeAccounts(List<Account> accounts) {
        try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            for (Account acc : accounts) {
                out.writeObject(acc);
            }
        } catch (IOException e) {
            System.out.println("Error writing accounts: " + e);
        }
    }
    public static Account findAccount(List<Account> accounts, int accNo) {
        for (Account acc : accounts) {
            if (acc.accountNumber == accNo) return acc;
        }
        return null;
    }
    public static void balanceInquiry() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter account number: ");
        int accNo = sc.nextInt();

        List<Account> accounts = readAccounts();
        Account acc = findAccount(accounts, accNo);

        if (acc != null) {
            System.out.println("Balance: " + acc.balance);
        } else {
            System.out.println("Account not found.");
        }
    }
    public static void deposit() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter account number: ");
        int accNo = sc.nextInt();
        System.out.print("Enter deposit amount: ");
        double amount = sc.nextDouble();

        List<Account> accounts = readAccounts();
        Account acc = findAccount(accounts, accNo);

        if (acc != null) {
            acc.balance += amount;
            writeAccounts(accounts);
            System.out.println("Amount deposited successfully.");
        } else {
            System.out.println("Account not found.");
        }
    }
    public static void withdraw() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter account number: ");
        int accNo = sc.nextInt();
        System.out.print("Enter withdraw amount: ");
        double amount = sc.nextDouble();

        List<Account> accounts = readAccounts();
        Account acc = findAccount(accounts, accNo);

        if (acc != null) {
            if (acc.balance >= amount) {
                acc.balance -= amount;
                writeAccounts(accounts);
                System.out.println("Amount withdrawn successfully.");
            } else {
                System.out.println("Insufficient balance.");
            }
        } else {
            System.out.println("Account not found.");
        }
    }
    public static void transfer() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter sender account number: ");
        int senderNo = sc.nextInt();
        System.out.print("Enter receiver account number: ");
        int receiverNo = sc.nextInt();
        System.out.print("Enter transfer amount: ");
        double amount = sc.nextDouble();

        List<Account> accounts = readAccounts();
        Account sender = findAccount(accounts, senderNo);
        Account receiver = findAccount(accounts, receiverNo);

        if (sender != null && receiver != null) {
            if (sender.balance >= amount) {
                sender.balance -= amount;
                receiver.balance += amount;
                writeAccounts(accounts);
                System.out.println("Transfer successful.");
            } else {
                System.out.println("Insufficient balance.");
            }
        } else {
            System.out.println("One or both accounts not found.");
        }
    }
}

