import java.util.Scanner;
public class arraypractice1 {
	public static void main(String [] args ){
		Scanner sohaib = new Scanner (System.in);
		int rows = sohaib.nextInt();
		int[][] arr = new int[rows][];
		for (int i =0 ;i<rows;i++){
			System.out.println("Enter the number of  columns for row "+(i+1));
			int columns = sohaib.nextInt();
			arr[i] = new int[columns];
 
			for (int j =0 ; j<columns ; j++){
				arr[i][j] = sohaib.nextInt();
			}
		}
			for (int i =0 ; i < rows ; i++){
				int sum = 0;
				int columns = arr[i].length;
				for (int j =0 ; j < columns ; j++){
					
					sum += arr[j][i];
				
				}
			System.out.println("The sum of number in column "  +sum);
			}
	
		for (int i =0 ; i < rows ; i++){
			int sum = 0;
			int columns = arr[i].length;
			for (int j =0 ; j < columns ; j++){
				//if (i==n){
				sum += arr[i][j];

				//}
			}
			System.out.println("The sum of number in row " + sum);
			//n++;
		}	
				
	}
}