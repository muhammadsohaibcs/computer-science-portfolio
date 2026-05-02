public class NewtonIteration {
	// computes x^n
	public static double power(double x, int n) {
		// TODO
		if (n==0){
			return 1;
		}
		double product=1;
		for (int i = 1 ; i <= n ; i++){
			product *= x;
		}
		return product;
	}

	// computes f := y^n - x
	public static double fun(double y, int n, double x) {
		// TODO
		double result =power(y, n);
		return result - x;

	}

	// computes f' = d/dy f
	public static double funDeriv(double y, int n, double x) {
		// TODO
		return n * power(y,n-1);
	}

	// represents ONE iteration step of the Newton method
	public static double newtonStep(double x, int n, double yAlt) {
		// TODO
		return yAlt - (fun(yAlt, n, x)/funDeriv(yAlt, n, x));
	}

	// computes x^(1/n) with precision epsilon
	public static double approxRoot(double x, int n, double epsilon) {
		// TODO
		double y1 = newtonStep(x, n, 1);
		double y2 = newtonStep(x, n, y1);
		while (Math.abs(y2-y1) >epsilon){
			y1=y2;
			y2= newtonStep(x, n, y2);
		}
		return y2;
	}
}