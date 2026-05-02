class Trapezoid :
    def __init__(self, a,b,h):
        self.a = a
        self.b = b
        self.h = h
    def calculate_area(self):
        return ((self.a + self.b)*self.h)/2
class Parallelogram:
    def __init__(self , a,h):
        self.a = a
        self.h = h
    def calculate_area(self):
        return (self.a * self.h)
class Comparison:
    def __init__(self , a,b):
        self.results ={}
    def shape(self,a,b):
        self.results[a]=b
    def max_Area (self):
        return max(self.results , self.results.get)
    
    