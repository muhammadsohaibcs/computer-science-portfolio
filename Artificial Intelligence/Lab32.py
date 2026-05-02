from collections import deque
class Graph2D:    
    def __init__(self , size):
        self.matrix = [ [0] * size for i in range(size)]
        self.vertixData = ['']*size
        self.size = size
        self.count =0
    def addVertices(self , data):
        if self.count < self.size and self.vertixData.count(data)==0:
            self.vertixData[self.count]=data
            self.count += 1
            print("data inserted sucessfully")
        else:
            print("Data not inserted.")
    def addEdges (self , point1 , point2):
        try:
            value1 =self.vertixData.index(point1)
            value2 =self.vertixData.index(point2)
            self.matrix[value1][value2] = 1
        except:
            print("These verix are not found")
    def printGraph(self):
        for i in range(self.size):
            if self.vertixData[i] != '':
                print(self.vertixData[i], end=" ---> ")
                for j in range(self.size):
                    if self.matrix[i][j] == 1:
                        print(self.vertixData[j], end=" ")
                print()
class Graph:    
    def __init__(self):
        self.dictionary = {}
    

    def addEdges(self, node):
        if node not in self.dictionary:   
            self.dictionary[node] = []
        else:
            print(f"Node {node} already exists.")

    def addVertices(self, node1, node2):
        if node1 in self.dictionary and node2 in self.dictionary:
            self.dictionary[node1].append(node2)
            self.dictionary[node2].append(node1)
        else:
            print("One or both nodes not found in graph")

    def printGraph(self):
        for key in self.dictionary:
            print(key, "->", self.dictionary[key])
    def bfsSortestPath(self , start , end):
        visited = set()
        queue = deque([[start]])
        while queue:
            path = queue.popleft()
            node = path[-1]
            if node==end:
                return path
            else:
                visited.add(node)
                for child in self.dictionary[node]:
                    if child not in visited:
                        newpath = list(path)
                        newpath.append(child)
                        queue.append(newpath)
        return None
                          

g = Graph()
for i in range(26):
    g.addEdges(i+1)
g.addVertices(1,2)
g.addVertices(2,3)
g.addVertices(3,4)
g.addVertices(4,5)
g.addVertices(4,26)
g.addVertices(5,6)
g.addVertices(6,7)
g.addVertices(6,8)
g.addVertices(7,9)
g.addVertices(9,8)
g.addVertices(9,10)
g.addVertices(10,11)
g.addVertices(11,12)
g.addVertices(11,13)
g.addVertices(13,14)
g.addVertices(14,15)
g.addVertices(15,16)
g.addVertices(15,17)
g.addVertices(17,18)
g.addVertices(18,19)
g.addVertices(19,20)
g.addVertices(20,21)
g.addVertices(21,22)
g.addVertices(22,23)
g.addVertices(23,24)
g.addVertices(24,25)
g.addVertices(25,26)
print(g.bfsSortestPath(1,16))



