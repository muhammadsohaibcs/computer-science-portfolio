public class task6 {
    public static void main(String[] args) {
        captilize("trw qwtyuet qwuteu");
        
    }
    public static void captilize (String word){
        int i = 1;
        String newWord = "";
        newWord += Character.toUpperCase(word.charAt(0));
        while (true) {
            if (i == word.length())
                break;
            if (Character.isWhitespace(word.charAt(i))){
                newWord += word.charAt(i);
                newWord += Character.toUpperCase(word.charAt(i+1));
                i++;
            }
            newWord += word.charAt(i);
            i++;
        }  
        System.out.println(newWord); 
    }
}
