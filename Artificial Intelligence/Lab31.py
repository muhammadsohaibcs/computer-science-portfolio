graph = {
    'Arad': ['Zerind', 'Timisoara', 'Sibiu'],
    'Zerind': ['Arad', 'Oradea'],
    'Oradea': ['Zerind', 'Sibiu'],
    'Sibiu': ['Arad', 'Oradea', 'Fagaras', 'Rimnicu Vilcea'],
    'Timisoara': ['Arad', 'Lugoj'],
    'Lugoj': ['Timisoara', 'Mehadia'],
    'Mehadia': ['Lugoj', 'Drobeta'],
    'Drobeta': ['Mehadia', 'Craiova'],
    'Craiova': ['Drobeta', 'Rimnicu Vilcea', 'Pitesti'],
    'Rimnicu Vilcea': ['Sibiu', 'Craiova', 'Pitesti'],
    'Fagaras': ['Sibiu', 'Bucharest'],
    'Pitesti': ['Rimnicu Vilcea', 'Craiova', 'Bucharest'],
    'Bucharest': ['Fagaras', 'Pitesti', 'Giurgiu', 'Urziceni'],
    'Giurgiu': ['Bucharest'],
    'Urziceni': ['Bucharest', 'Hirsova', 'Vaslui'],
    'Hirsova': ['Urziceni', 'Eforie'],
    'Eforie': ['Hirsova'],
    'Vaslui': ['Urziceni', 'Iasi'],
    'Iasi': ['Vaslui', 'Neamt'],
    'Neamt': ['Iasi']
}
def bfs_traversal(graph, start, goal):

    opened = [start]
    closed = []

    while opened:
        #Remove leftmost child from the opened list and call it node
        node = opened.pop(0)
        #If node is goal then return SUCCESS alogn with the traversal sequence.
        if node == goal:
          closed.append(node)
          return "SUCCESS", closed
        else:
            #Add node to closed
            closed.append(node)
            #Generate children of node. If they are already present in opened, discard them, else push them on right end of opened
            opened = opened + [child for child in graph[node] if child not in opened and child not in closed]
    return 'GOAL Not FOUND'

msg, bfsTraversal = bfs_traversal(graph,'Arad','Bucharest')
print(msg,"\nBFS Traversal = ", bfsTraversal)