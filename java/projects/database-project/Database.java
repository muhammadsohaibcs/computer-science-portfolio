import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;
public class Database {
    public static ArrayList <Integer> Array = new ArrayList<Integer>();
    public static Scanner sohaib =new Scanner (System.in);
    public static void main (String[] args){
        while (true){
        try {
                Array.clear();
            System.out.print(">>");
            String input = sohaib.nextLine().trim();
            String newString = "";
            for (int i = 0; i < input.length(); i++) {
                if ((input.charAt(i)==' ' && input.charAt(i+1)==' '))
                    continue;
                newString+=input.charAt(i);    
            }
            String original = "";
            for (int i = 0; i < newString.length(); i++) {
            if ((newString.charAt(i)==' ' && newString.charAt(i-1)=='=')||(newString.charAt(i)==' ' && newString.charAt(i+1)=='=')||(newString.charAt(i)==' ' && newString.charAt(i-1)==',')|| (newString.charAt(i)==' ' && newString.charAt(i+1)==',')||(newString.charAt(i)==' ' && newString.charAt(i-1)=='"')|| (newString.charAt(i)==' ' && newString.charAt(i+1)=='"'))
            continue;
            original+=newString.charAt(i);
            }
            int length=original.length();
            boolean check = true;
            if (length>16 && original.contains("(")  && original.charAt(length-1)==')'  && original.substring(0, 13).equalsIgnoreCase("create table ")){
                if (original.charAt(length-2)==','){
                    System.out.println("You must specify a column name after comma and it can not be empty at first");
                    continue;
                }
                else if(check){
                    for (int i = 0; i < original.length(); i++) {
                        if (original.charAt(i)==',' && original.charAt(i+1)==','){
                            System.out.println("You must specify columns values between comma");
                            check = false;
                            break;
                        }
                    }
                }
                if (check){
                    int index1 = original.indexOf("(", 13);
                    if (index1==13){
                        System.out.println("You have entered Invalid file Name");
                    }else{
                        String fileName = original.substring(13, index1).trim().concat(".txt");
                        if (checkFileName(fileName)){
                            createTables (original,length,fileName,index1);
                        }
                        else
                            System.out.println("You have entered Invalid file Name .Your file name must be according to java variables rules ");
                    }      
                }
            }   
            else if (length>11 && original.substring(0, 11).equalsIgnoreCase("drop table "))
                drop(original,length); 
            else if (original.equalsIgnoreCase("show all"))
                show(original,length);
            else if (length>17 && original.contains("(") && original.endsWith("\")") &&original.substring(0, 12).equalsIgnoreCase("Insert into ")){
                int index2 = original.indexOf(" ",12);
                int index3 = original.indexOf("(",12);
                if (index3!=-1 && index2!=-1 && index3 !=12 && (original.substring(original.indexOf(" ",12),original.indexOf("(",12))).trim().equalsIgnoreCase("values"))
                    insert(original,length);
                else
                System.out.println("Invalid Syntax!! type  help to read the syntax"); 
            }
            else if ( length>31 && original.substring(0,18).equalsIgnoreCase("select from table ")){
                int index4 = original.indexOf(" ",original.indexOf(" ",18 )) ;
                int index5 = original.indexOf(" ",index4+1);
                if (index5!=-1 && index5!=0 && original.substring(original.indexOf(" ", 18),index5+1).equalsIgnoreCase(" having ")){
                    selectfromcolumnsort(original, length,index5);
                }else
                System.out.println("Invalid Syntax!! type  help to read the syntax"); 
            }
            else if (length>18 && original.substring(0,18).equalsIgnoreCase("select from table ") && original.indexOf(" ",18)==-1)
                selectfrom (original,length);
            else if ( length>31 && original.substring(0,13).equalsIgnoreCase("update table ")){
                int index4 = original.indexOf(" ",original.indexOf(" ",13 )) ;
                int index5 = original.indexOf(" ",index4+1);
                int index6 = original.indexOf(" ",index5+1);
                int index7 = original.indexOf("\"",index6+1);
                int index8 = original.indexOf("\"",index7+1);
                int index9 = original.indexOf(" ",index8+1);
                int index10 = original.indexOf("=",index9);
                if (index7 !=-1 && index8 !=-1 && index10 !=-1 && original.substring(index4, index5+1).equalsIgnoreCase(" set ") && original.substring(index6, index7).equalsIgnoreCase(" to") && original.substring(index8+1, index9+1).equalsIgnoreCase("having ")){
                    update(original,length,index4,index5,index6,index7,index8,index9,index10);
                }
                else
                System.out.println("Invalid Syntax!! type  help to read the syntax");   
            }
            else if ( length>30 && original.substring(0,18).equalsIgnoreCase("delete from table ")){
                int index1 = original.indexOf(" ",18);
                int index2 = original.indexOf(" ",index1+1);
                if ( index1 !=-1 && index2 !=-1 && original.substring(index1,index2+1).equalsIgnoreCase(" having ") ){
                    int index3 = original.indexOf("=",index2);
                    deleteLine (original,length,index1,index2,index3);                    
                }
                else
                System.out.println("Invalid Syntax !! type  help to read the syntax");   
            }
            else if (original.equalsIgnoreCase("Help")){
                System.out.println("Available Commands:");
                System.out.println(" CREATE TABLE table_name (column1, column2, ...)");
                System.out.println(" DROP TABLE table_name");
                System.out.println(" SHOW TABLES");
                System.out.println(" INSERT INTO table_name VALUES (value1, value2, ...)");
                System.out.println(" SELECT FROM table_name WHERE column = value ORDER BY column");
                System.out.println(" UPDATE table_name SET column = value WHERE column = value");
                System.out.println(" DELETE FROM table_name WHERE column = value");
                System.out.println(" HELP - Shows this help message");
                System.out.println(" EXIT - Exits the program");
            }
            else
                System.out.println("Invalid Syntax!! type  help to read the syntax");   
    } catch (Exception e) {
        System.out.println(e);
        }
    }
    }
    public static void createTables (String original, int length,String fileName,int index1){  
        String [] columns = original.substring(index1+1,length-1).split(","); 
        if (columnscheck(columns)){
            File file = new File(fileName);
            try{
                if (file.createNewFile()){
                    System.out.println("New file created sucessfully");
                    FileWriter writer = new FileWriter(fileName,true);
                    for (int i = 0; i <columns.length; i++) {
                        writer.write(columns[i].trim());
                        writer.write("    ");
                    }
                    writer.write("\n");
                    writer.close();
                    System.out.println("Columns are made sucessfully ");
                }else{
                    System.out.println("file Already exists");               
                }
            }catch (Exception io){
                System.out.println(io.getMessage());
            }
       }else
            System.out.println("Columns name must be according to java variable name rules");    
    }
    public static boolean columnscheck(String[] columns) {
        for (int i = 0; i < columns.length; i++) {
            if (checkFileName(columns[i])){
                continue;
            }
            else
                return false;
        }
        return true;
    }
    public static boolean checkFileName(String a){
        String dictionary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOQRSTUVWXYZ0123456789$_";
        for (int idx = 0; idx < a.length(); idx++) {
            if (Character.isDigit(a.charAt(0))){
                return false;
            }
            if (dictionary.contains(""+a.charAt(idx))){
                return true;
            }
        }
        return false;    
    }
    public static void drop(String original,int length){
        String deletefile = original.substring(11,length).trim().concat(".txt");
        File file = new File(deletefile);
        if (file.exists()){
            System.out.printf("%30s \nThis file will be deleted !if you are sure to delete it press 1\n","Warning");
            String num = sohaib.nextLine();
            if (num.contentEquals("1")){
                if (file.delete())
                System.out.println("file deleted sucessfully");
                else
                System.out.println("File is not deleted");
            }else
                System.out.println("File is not deleted");  
        }else{
            System.out.println("No such file exists");
        }           
    }
    public static void show(String original,int length){    
        File file = new File("project.java");
        String filepath = file.getAbsolutePath();
        File fileshow = new File (filepath.substring(0,filepath.lastIndexOf("\\project.java")));
        String [] files =fileshow.list();
        System.out.println("all text files in project.java folder");
        for (int i = 0; i < files.length; i++) {
            if (files[i].endsWith(".txt"))
            System.out.println(files[i].substring(0,files[i].lastIndexOf(".txt")));
        } 
        System.out.println("End of List");   
    } 
    public static void insert(String original,int length){
        String fileName = original.substring(12, original.indexOf(" ",12)).concat(".txt");
        File file = new File (fileName);
        if (file.exists()){
            String str = original.substring(original.indexOf("(",12)+1,length-1).trim();
            if (checkValues(str)){
                String [] data = str.split("\",\"");
                write(data ,fileName);
            }
            else
                System.out.println("Invalid Syntax because comma is never stored here");   
        }else
            System.out.println("No file in the folder first make table");  
    }
    public static boolean checkValues (String  str){      
        if (str.contains("\",\",\"")|| str.endsWith(",\"")){
            return false;
        }
        return true;
    }
    public static void write (String [] data ,String fileName){
        try{
            int columnsData = data.length;
            BufferedReader reader = new BufferedReader(new FileReader(fileName));
            String firstLine =reader.readLine();
            String[] a=firstLine.split ("    ");
            int acolumns = a.length;
            if (acolumns!=columnsData){
                System.out.println("you have done some thing wrong in inserting the columns because" +acolumns +"are present in table but you are trying to insert " +columnsData +"columns");
            }
            else{
                FileWriter filewriter = new FileWriter(fileName,true);
                for (int i = 0; i < columnsData; i++) {
                    String word = data[i].trim();
                    if (i==0){
                        filewriter.write("\"" + word.substring(1, word.length()).trim() + "\"");
                        filewriter.write("    ");
                    }
                    else if (i==columnsData-1){
                        filewriter.write("\"" + word.substring(0, word.length()-1).trim() + "\"");
                        filewriter.write("    ");
                    }
                    else{
                        filewriter.write("\"" + word.substring(0, word.length()).trim() + "\"");
                        filewriter.write("    ");
                    }
                }
                filewriter.write("\n");
                filewriter.close();
                System.out.println("Inserted sucessfully");
            } 
        }catch (Exception io){
            System.out.println(io.getMessage());
        }                  
    }
    public static void selectfrom (String original, int length){
        String fileName = (original.substring(18, length)).concat(".txt");
        try {
            Scanner reader1= new Scanner (new File(fileName));
            String read =reader1.nextLine();
            reader1.useDelimiter("    "); 
            String[] strlength = read.split("    ");
            firstLine(strlength);         
            while (reader1.hasNextLine()){
                for (int i = 0; i < strlength.length; i++ ){
                    String word= reader1.next();
                    System.out.printf("%-20s   ",word.substring(1,word.length()-1).trim());
                }                   
                System.out.println();
                reader1.nextLine();
            }       
        } catch (Exception e) {
            System.out.println(e);
        }
    }
    public static void firstLine(String[] strlength){
        for (int i = 0; i < strlength.length; i++ ){
            System.out.printf("%-20s   ",strlength[i].trim());
        } 
        System.out.println();
        for (int i = 0; i < strlength.length; i++ ){
            String hypen = "";
            for (int j =0;j<strlength[i].length();j++){
                hypen+="-";
            }
            System.out.printf("%-20s   ",hypen);    
        } 
        System.out.println(); 
        
    }
    public static void printList (ArrayList <String []> sort){
        for (int i = 0; i < sort.size(); i++) {
            for (int j = 0; j < sort.get(i).length; j++) {
                System.out.printf("%-20s   ",sort.get(i)[j].replace("\"", ""));
            }
        System.out.println();               
        }
    }
    public static void findAll (String fileName, String column, String[] searchedvalues, ArrayList <String[]> sort,boolean a){
        try {
            Scanner reader1= new Scanner (new File(fileName));
            Scanner reader2= new Scanner (new File(fileName));
            String read1 =reader1.nextLine();
            String read2 =reader2.nextLine();
            reader1.useDelimiter("    ");
            String[] strlength = read1.split("    ");
            sort.add(strlength);
            if (a==true)
                firstLine(strlength);
            int count = 1;
            if (columnCheck(column,strlength)){
                while (reader1.hasNextLine()){
                    String line=reader2.nextLine();
                    for (int i = 0; i < strlength.length; i++ ){
                        String find = reader1.next().trim();
                        if (strlength[i].equalsIgnoreCase(column)){
                            for (int j = 0; j < searchedvalues.length; j++) {
                                String dumy = searchedvalues[j].trim();
                                String word = "\"" +dumy.substring(1,dumy.length()-1)+ "\"" ;         
                                if(find.equalsIgnoreCase(word)){
                                    sort.add(line.split("    "));
                                    Array.add (count);
                                }
                            }
                        }
                    }
                    count++ ;                         
                }
            }else{
                System.out.println("are only columns in the table and No column with this name");
            }
        }
        catch (Exception e) {
           
        }
    }
    public static void selectfromcolumnsort (String original, int length,int index5){
        String fileName = (original.substring(18,original.indexOf(" ",18))).trim().concat(".txt");
        File file = new File (fileName);
        ArrayList <String[]> sort = new ArrayList <String[]>();
        String sortcolumn ="";
        if (file.exists()){
            int index1 = original.indexOf("=");
            String column =original.substring(index5+1,index1).trim();
            if (original.lastIndexOf("\"")!=-1 && original.lastIndexOf("\"")!=index1+1){
                String values = original.substring(index1+1,original.lastIndexOf("\"")+1).trim();
                String[] searchedvalues = values.split(",");               
                int index2 = original.lastIndexOf("\"") ;
                if (index2==length-1){
                    findAll(fileName, column, searchedvalues, sort,true);
                    sort.remove(0);
                    printList(sort);
                    System.out.println("End of List"); 
                }
                else if (original.substring(index2+1,index2+9).equalsIgnoreCase("sort by ")){
                    sortcolumn = original.substring(index2+9,length).trim();
                    findAll(fileName, column, searchedvalues, sort,true);
                    int index =-1;
                    String [] arr= sort.get(0);
                        for (int j=0;j<arr.length;j++)
                            if (arr[j].equalsIgnoreCase(sortcolumn))
                                index = j;
                    sort.remove(0);
                    if (index!=-1){
                        for (int i = 0; i < sort.size()-1; i++) {
                            for (int j=0;j<sort.size()-1-i;j++){
                                if (sort.get(j)[index].compareTo(sort.get(j+1)[index])>0){
                                    String [] temp = sort.get(j);
                                    sort.set(j,sort.get(j+1));
                                    sort.set(j+1, temp);  
                                }
                            }
                        }
                    printList(sort);
                    System.out.println("End of List");     
                    }else{
                        System.out.println("are only columns in the table and No column with this name");
                    }
                }         
                else 
                    System.out.println("Invalid Syntax!! type  help to read the syntax"); 
            }
            else{
                System.out.println("Invalid Syntax!! type  help to read the syntax");
            }
        } else
                System.out.println("No such file exit first make table");    
    }
    // public static String[] checkSearchedValues(String[] searchedValues) {
    //     ArrayList <String > values = new ArrayList<String>() ;
    //     for (int i = 0; i < searchedValues.length-1; i++) {
    //         for (int j = i+1; j< searchedValues.length;j++){
    //             if (searchedValues[i].equalsIgnoreCase(searchedValues[j])){
    //                 continue;
    //             }
    //         }  
    //         values.  
    //     }
    //     return ;
    // } 
    public static boolean columnCheck(String column,String [] str) {
        for (int i = 0; i < str.length; i++) {
            if (column.equalsIgnoreCase(str[i].trim())){
                return true;
            }
        }
        return false;
    } 
    public static void update ( String original, int length,int index1,int index2,int index3,int index4,int index5,int index6,int index7){
        String fileName = original.substring(13,index1).trim().concat(".txt");
        File file2 = new File ("0temp.txt");
        File file = new File(fileName);
       
        if (file.exists()){
            String columnToBeChanged = original.substring(index2,index3).trim();
            try {
            Scanner reader1= new Scanner (file);
            String read1 =reader1.nextLine();
            String[] strlength = read1.split("    ");
            reader1.useDelimiter("    ");
            if (columnCheck(columnToBeChanged,strlength )){
                String setvalue = original.substring(index4,index5+1).trim();
                String searchedcolumn = original.substring(index6, index7).trim();
                String searchedvalues = original.substring(index7+1, length).trim();
                if (checkValues(searchedvalues)){
                    String [] s= searchedvalues.split("\",\""); 
                    ArrayList <String[]> find = new ArrayList <String[]>();
                    findAll (fileName, searchedcolumn, s,find ,false);
                    updatearray (find ,setvalue,columnToBeChanged);
                    mainupdate (file,file2,find); 
                }   
            } 
        } catch (Exception e) {
            System.out.println(e);
        }    
    }
    
    }  
    public static void updatearray (ArrayList<String[]> sort,String setvalues,String sortcolumn){
        int index =-1;
                String [] arr= sort.get(0);
                    for (int j=0;j<arr.length;j++)
                        if (arr[j].equalsIgnoreCase(sortcolumn))
                            index = j;
        for (int i = 0; i < sort.size(); i++) {
            for (int j = 0; j < sort.get(i).length; j++) {
                if (j == index){
                    sort.get(i)[j]= setvalues;
                }
            }             
        }
         sort.remove(0);
    } 
    public static void mainupdate (File file,File file2, ArrayList <String[]> find) {
        try {
            Scanner fileR1= new Scanner(file);
            FileWriter FW = new FileWriter(file2,true);
            int count = 0; 
            if (Array.size()==0){
                System.out.println("No such row exists.so no row is updated");
            }
            else{
                System.out.println(Array.size() + " rows has been updated");
                while (fileR1.hasNextLine()){
                        if (Array.get(0)==count){
                            for (int j = 0; j < find.get(0).length; j++) {
                                String word = find.get(0)[j].trim();
                                FW.write("\"" + word.substring(1, word.length()-1).trim() + "\"");
                                FW.write("    ");
                            }
                            fileR1.nextLine();
                            FW.write("\n");
                            if (Array.size()>1) 
                                Array.remove(0);
                            count++; 
                              
                        }else{
                            FW.write(fileR1.nextLine());
                            FW.write("\n");   
                            count ++;
                        }      
                } 
                FW.close(); 
                File file3 = new File ("0temp.txt");
                if (replaceFile(file, file3))
                System.out.println("Sucessfull");

            }
        } catch (Exception e) {
            System.out.println(e);
        }   
    }
    public static void deleteLine(String original,int length,int index1,int index2,int index3){
        String fileName = original.substring(18,index1).trim().concat(".txt");
        String searchedColumn = original.substring(index2, index3).trim();
        String searchedValues = original.substring(index3+1,length).trim();
             String [] s= searchedValues.split("\",\""); 
                    ArrayList <String[]> find = new ArrayList <String[]>();
                    findAll (fileName, searchedColumn, s,find ,false);
                    try {
                        File file1 = new File (fileName);
                        Scanner fileR1= new Scanner(new File (fileName));
                        FileWriter FW = new FileWriter("0temp.txt",true);
                        File file2 = new File ("0temp.txt");
                        System.out.println(Array.size() + " rows has been deleted sucessfully");
                        int count = 0; 
                        while (fileR1.hasNextLine()){
                            if (Array.get(0)==count){
                                fileR1.nextLine();
                                if (Array.size()>1) 
                                    Array.remove(0);
                                
                                count++;   
                            }    else{
                                FW.write(fileR1.nextLine());
                                FW.write("\n");   
                                count ++;
                            }       
                        } 
                        FW.close();
                        if (replaceFile(file1, file2)){
                            System.out.println("sucess");
                        }
                    } catch (Exception e) {
                        System.out.println(e);
                    }
    } 
    public static boolean replaceFile(File originalFile, File tempFile) {
        if (originalFile.delete()) {
            return tempFile.renameTo(originalFile);
        }
        return false;
    }
     
}