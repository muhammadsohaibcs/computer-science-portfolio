
from operator import itemgetter
graph = {'Arad': [['Zerind', 75], ['Timisoara', 118], ['Sibiu', 140]],
         'Zerind': [['Oradea', 71], ['Arad', 75]],
         'Oradea': [['Zerind', 71], ['Sibiu', 151]],
         'Sibiu': [['Rimniciu Vilcea', 80], ['Fagaras', 99], ['Arad', 140], ['Oradea', 151]],
         'Fagaras': [['Sibiu', 99], ['Bucharest', 211]],
         'Rimniciu Vilcea': [['Pitesti', 97], ['Craiova', 146], ['Sibiu', 80]],
         'Timisoara': [['Lugoj', 111], ['Arad', 118]],
         'Lugoj': [['Mehadia', 70], ['Timisoara', 111]],
         'Mehadia': [['Lugoj', 70], ['Dobreta', 75, 242]],
         'Dobreta': [['Mehadia', 75], ['Craiova', 120]],
         'Pitesti': [['Craiova', 138], ['Bucharest', 101]],
         'Craiova': [['Pitesti', 138], ['Dobreta', 120], ['Rimniciu Vilcea', 146]],
         'Bucharest': [['Giurgiu', 90], ['Urziceni', 85], ['Fagaras', 211], ['Pitesti', 101]],
         'Giurgiu': [['Bucharest', 90]],
         'Urziceni': [['Vaslui', 142], ['Hirsova', 98], ['Bucharest', 85]],
         'Vaslui': [['Lasi', 92], ['Urziceni', 142]],
         'Lasi': [['Neamt', 87], ['Vaslui', 92]],
         'Neamt': [['Lasi', 87]],
         'Hirsova': [['Eforie', 86], ['Urziceni', 98]],
         'Eforie': [['Hirsova', 86]], }


graph = {'A': [['B', 6], ['C', 9], ['E', 1]],
         'B': [['A', 6], ['D', 4], ['E', 2]],
         'C': [['A', 9], ['F', 2], ['G', 3]],
         'D': [['B', 4], ['E', 5], ['F', 7]],
         'E': [['A', 1], ['B', 2], ['D', 5] , ['F' ,8] ],
         'F': [['C', 2], ['D', 7], ['E', 8]],
         'G': [['C', 3]] }

def astarik_traversal(graph, start, goal):
    opened = [start]
    closed =[]
    while opened:
        node = opened.pop(0)
        print('current',node)
        if node[0][-1] == goal[0]:
          return [node]
        else:
            closed.append(node[0][-1])
            print(closed)
            opened_nodes = [node[0] for node in opened]
            opened = opened + [[node[0]+item[0],node[1]+item[1]] for item in graph[node[0][-1]] if node[0]+item[0] not in opened_nodes and item[0] not in closed] #]
            print(opened)
        opened.sort(key=itemgetter(1))
    return 'GOAL Not FOUND'

print(astarik_traversal(graph, ['C', 0], ['B', 0]))