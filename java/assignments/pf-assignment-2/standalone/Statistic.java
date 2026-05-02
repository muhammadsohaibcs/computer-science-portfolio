public class Statistic {
	// ==================== min ====================
	public static double min2(double a, double b) {
		if (a>b) 
			return b;
		return a;
	}
	public static double min3(double a, double b, double c) {
		if (a<b && a<c)
			return a;
		if (b<a && b<c)
			return b;
		else
			return c;
	}

	public static double min7(double a, double b, double c, double d, double e, double f, double g) {
		if (a<=b && a<=c && a<=d && a<=e && a<=f && a<=g)
			return a;
		else if (b<=a && b<=c && b<=d && b<=e && b<=f && b<=g)
			return b;
		else if (c<=a && c<=b && c<=d && c<=e && c<=f && c<=g)
			return c;
		else if (d<=b && d<=c && d<=a && d<=e && d<=f && d<=g)
			return d;
		else if (e<=b && e<=c && e<=d && e<=a && e<=f && e<=g)
			return e;
		else if (f<=b && f<=c && f<=d && f<=a && f<=a && f<=g)
			return b;
		else
			return g;
	}

	// ==================== max ====================
	public static double max2(double a, double b) {
		if (a>b) 
			return a;
		return b;
	}

	public static double max3(double a, double b, double c) {
		if (a>b && a>c)
			return a;
		if (b>a && b>c)
			return b;
		else
			return c;
	}

	public static double max7(double a, double b, double c, double d, double e, double f, double g) {
		if (a>=b && a>=c && a>=d && a>=e && a>=f && a>=g)
			return a;
		else if (b>=a && b>=c && b>=d && b>=e && b>=f && b>=g)
			return b;
		else if (c>=a && c>=b && c>=d && c>=e && c>=f && c>=g)
			return c;
		else if (d>=b && d>=c && d>=a && d>=e && d>=f && d>=g)
			return d;
		else if (e>=b && e>=c && e>=d && e>=a && e>=f && e>=g)
			return e;
		else if (f>=b && f>=c && f>=d && f>=a && f>=a && f>=g)
			return f;
		else
			return g;
	}

	// ==================== mean ====================
	public static double mean3(double a, double b, double c) {
		return (a+b+c)/3; // TODO
	}

	public static double mean7(double a, double b, double c, double d, double e, double f, double g) {
		return (a+b+c+d+f+e+g)/7;// TODO
	}

	// ==================== Median ====================
	public static double median3(double a, double b, double c) {
		// TODO
		double num1 =max3(a,b,c);
		double num2 = min3(a,b,c);
		if ((num1 ==a && num2==c) || (num1 ==c && num2==a) )
			return b;
		else if ((num1 ==a && num2==b) || (num1 ==b && num2==a))
			return c;
		else
			return a;
	}

	public static double median7(double a, double b, double c, double d, double e, double f, double g) {
		
		for (int i =1;i<=3;i++) {
			double num1 = max7(a,b,c,d,e,f,g);
			if (num1==a) 
				a= min7(a,b,c,d,e,f,g);
			else if (num1==b) 
				b = min7(a,b,c,d,e,f,g);
			else if (num1==c) 
				c = min7(a,b,c,d,e,f,g);
			else if (num1==d) 
				d = min7(a,b,c,d,e,f,g);
			else if (num1==e) 
				e = min7(a,b,c,d,e,f,g);
			else if (num1==f) 
				f = min7(a,b,c,d,e,f,g);
			else 
				g = min7(a,b,c,d,e,f,g);
		}
		return max7(a,b,c,d,e,f,g);
	}
}
