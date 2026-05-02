public class GenericFib {
    
    public static double fibNaiveRec(double a, double b, int c, int n){
        if (n<c && n>=0)
            return n;
        else if (n%2==0 && n>=c)
            return (a*fibNaiveRec(a,b,c,n-1))+fibNaiveRec(a,b,c,n-c);
        else if (n%2!=0 && n>=c)
            return (b*fibNaiveRec(a,b,c,n-1))+fibNaiveRec(a,b,c,n-c);
        else 
            return n;
    } 
        public static double[]  initDP(int n){
            double[] arr = new double[n];
            for (int i=0 ; i<n;i++) {
            	arr[i]=Double.NaN;
            }
            return arr;
        }
        public static double fibDP(double a, double b, int c, int n){
        	double[] arr =initDP(n);
        	return helper (a,b,c,n,arr);
                            
    }
        public static double helper(double a, double b, int c, int n,double [] arr){
        if (n<c && n>=0){
            return n;
        }
        else if ((n%2==0) && n>=c){
            if (Double.isNaN(arr[n-1]))
                arr[n-1]=helper(a,b,c,n-1,arr);
            if (Double.isNaN(arr[n-c]))
                arr[n-c]=helper(a,b,c,n-c,arr);
            return (a*arr[n-1]+arr[n-c]);
        }
        else if ((n%2!=0) && n>=c){
            if (Double.isNaN(arr[n-1]))
                arr[n-1]=helper(a,b,c,n-1,arr);
            if (Double.isNaN(arr[n-c]))
                arr[n-c]=helper(a,b,c,n-c,arr);
            return (b*arr[n-1]+arr[n-c]);
        }
        else 
            return n;

        }
}

