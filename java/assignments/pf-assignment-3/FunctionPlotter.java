public class FunctionPlotter {
    public static char[][] plottingArea;

    public static void newPlottingArea(int width, int height) {
        plottingArea = new char[width][height];
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                plottingArea[i][j] = ' ';
            }
        }
        printPlottingArea();
    }

    public static boolean plotChar(int x, int y, char c) {
        if (x >= 0 && x < plottingArea.length && y >= 0 && y < plottingArea[0].length) {
            plottingArea[x][y] = c;
            return true;
        }
        return false;

    }
    

    public static void plotHorizontalLine(int xStart, int xEnd, int y, char c) {
        for (int x = xStart; x <= xEnd; x++) {
            plotChar(x, y, c);
        }
    }

    public static void plotVerticalLine(int x, int yStart, int yEnd, char c) {
        for (int y = yStart; y <= yEnd; y++) {
            plotChar(x, y, c);
        }
    }

    public static void plotBox(int xStart, int yStart, int xEnd, int yEnd) {
        plotHorizontalLine(xStart, xEnd, yStart, '-');
        plotHorizontalLine(xStart, xEnd, yEnd, '-');
        plotVerticalLine(xStart, yStart, yEnd, '|');
        plotVerticalLine(xEnd, yStart, yEnd, '|');
        plotChar(xStart, yStart, '+');
        plotChar(xEnd, yStart, '+');
        plotChar(xStart, yEnd, '+');
        plotChar(xEnd, yEnd, '+');
        printPlottingArea();
    }

    public static void plotString(int x, int y, String s) {
        for (int i = 0; i < s.length(); i++) {
            plotChar(x + i, y, s.charAt(i));
        }
    }

    public static int functionToPlot(int x) {
        return (int) Math.round(10 * Math.sin(0.3 * x));
    }

    public static void plotFunction(int xStart, int xEnd, int xOrigin, int yOrigin) {
        for (int x = xStart; x <= xEnd; x++) {
            int y = functionToPlot(x);
            plotChar(xOrigin + x, yOrigin + y, '.');
        }
    }

    public static void printPlottingArea() {
        for (int y = plottingArea[0].length - 1; y >= 0; y--) {
            for (int x = 0; x < plottingArea.length; x++) {
                System.out.print(plottingArea[x][y]);
            }
            System.out.println();
        }
    }
    public static void main(String[] args) {
        newPlottingArea(7, 7);
        plotBox(0, 0, 5, 5);
    }
}
