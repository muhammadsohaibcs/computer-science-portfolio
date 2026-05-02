import random
MINIMUM = 1 
MAXIMUM = 20
NUMBER = random.randint(MINIMUM, MAXIMUM) 
GUESS = None 
ANOTHER = None 
TRY = 0 
RUNNING = True 
print ("Alright...")
while RUNNING: 
    GUESS = input("What is your lucky number? ") 
    if int(GUESS) < NUMBER: 
        print ("Wrong, too low." )
    elif int(GUESS) > NUMBER: 
        print ("Wrong, too high." )
    elif GUESS.lower() == "exit": 
        print ("Better luck next time.") 
    elif int(GUESS) == NUMBER: 
        print ("Yes, that's the one, %s." % str(NUMBER) )
        if TRY < 2: 
            print ("Impressive, only %s tries." % str(TRY)) 
        elif TRY > 2 and TRY < 10: 
            print ("Pretty good, %s tries." % str(TRY) )
        else: 
            print ("Bad, %s tries." % str(TRY)) 
        RUNNING = False 
    TRY += 1 
    
    

name  =  input('What  is  your  name?  ') 
print('Hello ' + name) 
 
job  =  input('What  is  your  job?  ') 
print('Your  job  is  '  +  job) 
 
num  =  input('Give  me  a  number?  ') 
print('You said: ' + str(num))


# 1. Calculate the sum of all the values between 0-10 using while loop
i = 0
total = 0
while i <= 10:
    total += i
    i += 1
print("Sum of values from 0 to 10 is:", total)


# 2. Accept 5 integer values from user and display their sum
sum_5 = 0
for j in range(5):
    num = int(input(f"Enter integer {j+1}: "))
    sum_5 += num
print("Sum of 5 integers is:", sum_5)


# 3. Accept an integer value from user and check whether it is prime or not
n = int(input("Enter a number to check prime or not: "))
if n > 1:
    is_prime = True
    for k in range(2, int(n**0.5) + 1):
        if n % k == 0:
            is_prime = False
            break
    if is_prime:
        print(n, "is a prime number.")
    else:
        print(n, "is not a prime number.")
else:
    print(n, "is not a prime number.")


# 4. Keep accepting integer values until 0 is entered, display sum
sum = 0
while True:
    val = int(input("Enter an integer (0 to stop): "))
    if val == 0:
        break
    sum_until_zero += val
print("Sum of all entered values is:", sum)


# 5. Check whether a number is even or not
num_check = int(input("Enter a number to check even or not: "))
if num_check % 2 == 0:
    print(num_check, "is Even.")
else:
    print(num_check, "is Odd.")
