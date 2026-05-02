import random
def board():
    for row in range(5):
        for column in range(5):
            if List[row][column] == X0:
                print(List[row][column], end=" | ")
            elif List[row][column] == Not_randomX0:
                print(List[row][column], end=" | ")
            else:
                print(List[row][column],end=" | ")
        print()
        print("-------------------")
def turns(turn):
    while turn <= 30:
        if turn % 2 == 0:
            try:
                num1R = int(input(f"{player1} Enter row number and remember you have {X0}: "))
                num1R=num_check("num1R",num1R)
            except Exception as f:
                print("Invalid Inputs")
                print(f)
                num1R =num_check("num1R")
            try:
                num1C = int(input(f"{player1} Enter column number and remember you have {X0}: "))
                num1C=num_check("num1C",num1C)
            except Exception as f:
                print("Invalid Inputs")
                print(f)
                num1C=num_check("num1C")
            if double_check(num1R,num1C):
                List[num1R].pop(num1C)
                List[num1R].insert(num1C,X0)
                Chosen_Number.append((num1R,num1C))
            else:
                turns(turn)
            board()
        else:
            try:
                num2R = int(input(f"{player2} Enter row number and remember you have {Not_randomX0}: "))
                num2R=num_check("num2R",num2R)
            except Exception as f:
                print("Invalid Inputs")
                print(f)
                num2R=num_check("num2R")
            try:
                num2C = int(input(f"{player2} Enter column number and remember you have {Not_randomX0}: "))
                num2C= num_check("num2C",num2C)
            except Exception as f:
                print(f)
                print("Invalid Inputs")
                num2C=num_check("num2C")
            if double_check(num2R,num2C):
                List[num2R].pop(num2C)
                List[num2R].insert(num2C,Not_randomX0)
                Chosen_Number.append((num2R,num2C))
            else:
                turns(turn)
            board()
        if check_winner():
            break
        elif all ( column in ("X" , "0") for row in List for column in row):
            print("Match Draw")
            break            
        turn += 1
def check_winner():
    for row in range(5):
        if all(List[row][column]==X0 for column in range(5)) or all (List[column][row]==X0 for column in range(5)):
            print(f"Congratulation {player1} for wining the match \nAnd {player2} you also played really well")
            return True
        if all(List[row][column]==Not_randomX0 for column in range(5)) or all (List[column][row]==Not_randomX0 for column in range(5)):
            print(f"Congratulation {player2} for wining the match \nAnd {player1} you also played really well")
            return True  
    
    if all (List[row][column]==X0 for row in range (5) for column in range(5) if row==column) or all ( List[row][column]==X0 for row in range (5) for column in range(5) if row+column==4):
        print(f"Congratulation {player1} for wining the match \nAnd {player2} you also played really well")
        return True
    if all (List[row][column]==Not_randomX0 for row in range (5) for column in range(5) if row==column) or all ( List[row][column]==Not_randomX0 for row in range (5) for column in range(5) if row+column==4):
        print(f"Congratulation {player2} for wining the match \nAnd also {player1} you also played really well")
        return True
    return False
def num_check(name, num=6):
    while num > 5 or num < 1:
        print("You have entered an invalid number")
        try:
            if name == "num1R":
                value = int(input(f"{player1} Enter row number and remember you have {X0}: "))
            elif name == "num1C":
                value = int(input(f"{player1} Enter column number and remember you have {X0}: "))
            elif name == "num2R":
                value = int(input(f"{player2} Enter row number and remember you have {Not_randomX0}: "))
            elif name == "num2C":
                value = int(input(f"{player2} Enter column number and remember you have {Not_randomX0}: "))
            if 0 < value < 6:
                num = value
            else:
                print("Enter a number between 1 and 5.")
        except ValueError:
            print("Invalid input! Please enter a valid integer.")    
    return num - 1
def double_check(num1,num2):
    if (num1,num2) in Chosen_Number:
        print("Invalid!! You have entered value again")
        return False
    else:
        return True        
play = True        
while play:
    List = [[" " for row in range(5)] for column in range(5)]
    Chosen_Number = []
    while True:
        player1 = input("Enter player1 name: ")
        player2 = input("Enter player2 name: ")
        if player1==player2:
            print("Both player donot have same name.It can cause confusion.So change one name.")
            continue
        else:
            break
    rand_player = random.choice([player1, player2])
    X0 = random.choice(["X", "0"])
    Not_randomX0 = "0" if X0 == "X" else "X"    
    board()
    if rand_player == player1:
        try:
            num1R = int(input(f"{player1} Enter row number and remember you have {X0}: "))
            num1R=num_check("num1R",num1R)
        except Exception as f:
            print("Invalid Inputs")
            print(f)
            num1R=num_check("num1R")
        try:
            num1C = int(input(f"{player1} Enter column number and remember you have {X0}: "))
            num1C=num_check("num1C",num1C)
        except Exception as f:
            print("Invalid Inputs")
            print(f)
            num1C=num_check("num1C")
        List[num1R].pop(num1C)
        List[num1R].insert(num1C,X0)
        Chosen_Number.append((num1R,num1C))
        board()
        turn = 3
    else:
        try:
            num2R = int(input(f"{player2} Enter row number and remember you have {Not_randomX0}: "))
            num2R=num_check("num2R",num2R)
        except Exception as f:
            print("Invalid Inputs")
            print(f)
            num2R=num_check("num2R")
        try:
            num2C = int(input(f"{player2} Enter column number and remember you have {Not_randomX0}: "))
            num2C= num_check("num2C",num2C)
        except Exception as f:
            print("Invalid Inputs")
            print(f)
            num2C=num_check("num2C")
        List[num2R].pop(num2C)
        List[num2R].insert(num2C, Not_randomX0)
        Chosen_Number.append((num2R,num2C))
        board()
        turn = 2
    turns(turn)
    Play_again=input("Do you want to play again ? if Yes write y if No write n :").upper()
    while Play_again!="Y" and Play_again!= "N":
        print("You have entered Invalid Inputs")
        Play_again=input("Do you want to play again ? if Yes write y if No write n :").upper()
    if Play_again=="Y":
       play = True
       del List
       del Chosen_Number
       Chosen_Number = []
       List=[[" " for row in range(5)] for column in range (5)]   
    elif Play_again=="N":
        play = False
else:
    print("Thank you for playing!")
