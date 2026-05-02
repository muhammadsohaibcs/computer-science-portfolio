import random
List = [[(i+5*j+1) for i in range(5)] for j in range(5)]
Chosen_Number = []
def board(numX=34, num0=34):
    for s in range(5):
        for d in range(5):
            if List[s][d] == X0:
                print(List[s][d], end="  | ")
            elif List[s][d] == Not_randomX0:
                print(List[s][d], end="  | ")
            else:
                if numX == List[s][d]:
                    List[s][d] = X0
                elif num0 == List[s][d]:
                    List[s][d] = Not_randomX0
                if List[s][d] == X0 or List[s][d] == Not_randomX0:
                    print(f" {List[s][d]}", end=" | ")
                else:
                    print(f"{List[s][d]:2}", end=" | ")
        print()
        print("------------------------")
def turns():
    turn = value
    while turn <= 26:
        if turn % 2 == 0:
            try:
             numX = int(input(f"{player1} Enter number and you have {X0}: "))
            except Exception as f:
                print("Invalid Input")
                print (f)
            numX = num_checkX(numX)
            Chosen_Number.append(numX)
            board(numX)
        else:
            try:
                num0 = int(input(f"{player2} Enter number and you have {Not_randomX0}: "))
            except Exception as f:
                print("Invalid Input")
                print (f)
            num0 = num_check0(num0)
            Chosen_Number.append(num0)
            numX = 34
            board(numX, num0)
        if check_winner():
            break
        turn += 1
    else:
        print("Match draw")
def check_winner():
    for i in range(5):
        if all(List[i][j] == X0 for j in range(5)) or all(List[j][i] == X0 for j in range(5)):
            print(f"Congratulations!{player1} having {X0} wins the game")
            return True
        if all(List[i][j] == Not_randomX0 for j in range(5)) or all(List[j][i] == Not_randomX0 for j in range(5)):
            print(f"Congratulations!{player2} having {Not_randomX0} wins the game")
            return True
    if all(List[i][i] == X0 for i in range(5)) or all(List[i][4 - i] == X0 for i in range(5)):
        print(f"Congratulations!{player1} having {X0} wins the game")
        return True
    if all(List[i][i] == Not_randomX0 for i in range(5)) or all(List[i][4 - i] == Not_randomX0 for i in range(5)):
        print(f"Congratulations! {player2} having {Not_randomX0} wins the game")
        return True
    return False
def num_checkX(numX):
    while numX > 25 or numX < 1 or numX in Chosen_Number:
        print("YOU have entered an invalid number")
        try:
            numX = int(input(f"{player1} Enter number and remember you have {X0}: "))
        except Exception as f:
            print("Invalid Inputs")
            print(f)
    return numX
def num_check0(num0):
    while num0 > 25 or num0 < 1 or num0 in Chosen_Number:
        print("YOU have entered an invalid number")
        try:
            num0 = int(input(f"{player2} Enter number and remember you have {Not_randomX0}: "))
        except Exception as f:
            print("Invalid Inputs")
            print(f)
    return num0
        
play = True        
while play:

    player1 = input("Enter player1 name: ")
    player2 = input("Enter player2 name: ")

    rand = random.choice([player1, player2])

    X0 = random.choice(["X", "0"])
    Not_randomX0 = "0" if X0 == "X" else "X"
    board()

    if rand == player1:
        try:
            numX = int(input(f"{player1} Enter number and you have {X0}: "))
        except Exception as f:
                print("Invalid Input")
                print (f)
        numX = num_checkX(numX)
        Chosen_Number.append(numX)
        board(numX)
        value = 3
    else:
        try:
            num0 = int(input(f"{player2} Enter number and you have {Not_randomX0}: "))
        except Exception as f:
            print("Invalid Input")
            print (f)
        num0 = num_check0(num0)
        numX = 34
        Chosen_Number.append(num0)
        board(numX, num0)
        value = 2
    turns()
    Play_again=input("Do you want to play again ? if Yes write y if No write n :").upper()
    while Play_again!="Y" or "N":
        print("You have entered Invalid Inputs")
        Play_again=input("Do you want to play again ? if Yes write y if No write n :").upper()
    if Play_again=="Y":
       play = True
    elif Play_again=="N":
        play = False
else:
    print("Thank you for playing!")
