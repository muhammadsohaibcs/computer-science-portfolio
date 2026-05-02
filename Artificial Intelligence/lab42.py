DIRECTIONS = [(-1, -1), (-1, 0), (-1, 1),(0, -1),(0, 1),(1, -1),  (1, 0), (1, 1)]

def is_valid(x, y, board, visited):
    return 0 <= x < len(board) and 0 <= y < len(board[0]) and not visited[x][y]

def dfs(board, word, index, x, y, visited):
    if index == len(word):
        return True
    if not is_valid(x, y, board, visited):
        return False
    if board[x][y] != word[index]:
        return False

    visited[x][y] = True
    for dx, dy in DIRECTIONS:
        if dfs(board, word, index + 1, x + dx, y + dy, visited):
            return True
    visited[x][y] = False
    return False

def exists(board, word):
    rows, cols = len(board), len(board[0])
    visited = [[False] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            if board[i][j] == word[0]:
                if dfs(board, word, 0, i, j, visited):
                    return True
    return False

def find_valid_words(board, dictionary):
    valid_words = []
    for word in dictionary:
        if exists(board, word):
            valid_words.append(word)
    return valid_words


board = [
    ['M', 'S', 'E', 'F'],
    ['R', 'A', 'T', 'D'],
    ['L', 'O', 'N', 'E'],
    ['K', 'A', 'F', 'B']
]


dictionary = ["START", "NOTE", "SAND", "STONED"]


result = find_valid_words(board, dictionary)
print("Valid words:", result)
