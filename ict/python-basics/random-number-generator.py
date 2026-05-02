import random as r
number=r.randint(1,100)
while True:
    while True:
        try:
            guess=int(input("Enter a number between 1 and 100 to guess the number : "))
            if guess >100 or guess<0:
                print("you have entered an Invalid number")
                while True:
                    try:
                        guess=int(input("Please enter a number between 1 and 100 : "))
                        if guess >100 or guess<0:
                            continue
                        else:
                            break
                    except Exception:
                        print("You have enterd Invalid Input!!!")
                        continue
            break
        except Exception:
            print("You have enterd Invalid Input!!!")
    if guess==number:
        print("Congratulation!You have judjed the number correctly.")
        break
    elif guess - number<=5 and guess-number >=-5 :
        print("You are very close to judge the number. ")
    elif guess>number:
        print("your guess is greater than number")
    else:
        print("Your guess is less than number")