DIRECTIONS = [(-1, -1), (-1, 0), (-1, 1),
              (0, -1),          (0, 1),
              (1, -1),  (1, 0), (1, 1)]

def is_valid(x, y, visited, rows, cols):
    return 0 <= x < rows and 0 <= y < cols and not visited[x][y]

def dfs(board, x, y, visited, path, depth, max_depth, results):
    if depth > max_depth:
        return
    path += board[x][y]
    if len(path) == max_depth:
        results.add(path)
    visited[x][y] = True
    for dx, dy in DIRECTIONS:
        nx, ny = x + dx, y + dy
        if is_valid(nx, ny, visited, len(board), len(board[0])):
            dfs(board, nx, ny, visited, path, depth + 1, max_depth, results)
    visited[x][y] = False  

def iterative_deepening(board, target_lengths):
    results = {length: set() for length in target_lengths}
    rows, cols = len(board), len(board[0])
    for length in target_lengths:
        for i in range(rows):
            for j in range(cols):
                visited = [[False]*cols for _ in range(rows)]
                dfs(board, i, j, visited, "", 1, length, results[length])
    return results

board = [
    ['M', 'S', 'E', 'F'],
    ['R', 'A', 'T', 'D'],
    ['L', 'O', 'N', 'E'],
    ['K', 'A', 'F', 'B']
]

lengths = [5, 6, 7, 8]

all_words_by_length = iterative_deepening(board, lengths)

for length in lengths:
    print(f"Words of length {length}:")
    for word in sorted(all_words_by_length[length]):
        print(word)
    print("\n")
