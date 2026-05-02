public class GrayCode {
    public static int prevLength(int len) {
        if (len % 2 == 0) {
            return len / 2;
        }
        int powerOfTwo = 1;
        while (powerOfTwo * 2 < len) {
            powerOfTwo *= 2;
        }
        return powerOfTwo;
    }
    public static String[] generate(int len) {
    	if (len==0) {
    		 return new String[]{};
    	}
        if (len == 1) {
            return new String[]{"0"};
        } else if (len == 2) {
            return new String[]{"0", "1"};
        }
        int prevLen = prevLength(len);
        String[] smallerGrayCode = generate(prevLen);
        String[] result ;
        int b;
        if (smallerGrayCode.length * 2>len) {
        	b = (smallerGrayCode.length * 2)-len;
        	result = new String[(smallerGrayCode.length * 2)-b];
        	for (int i = 0; i < smallerGrayCode.length; i++) {
                result[i] = "0" + smallerGrayCode[i];
            }
            for (int i = 0; i < smallerGrayCode.length-b; i++) {
                result[smallerGrayCode.length + i] = "1" + smallerGrayCode[smallerGrayCode.length - 1 - i];
            }
        }
        else {
        	result = new String[(smallerGrayCode.length * 2)];
        	for (int i = 0; i < smallerGrayCode.length; i++) {
                result[i] = "0" + smallerGrayCode[i];
            }
            for (int i = 0; i < smallerGrayCode.length; i++) {
                result[smallerGrayCode.length + i] = "1" + smallerGrayCode[smallerGrayCode.length - 1 - i];
            }
        }
        
        return result;
    }
}