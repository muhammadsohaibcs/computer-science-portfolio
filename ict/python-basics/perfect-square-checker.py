import math
while True:
    try:
        num=eval(input("Enter a number:"))
        break
    except Exception:
        print("You have entered an Invalid Input")
        continue
num = math.sqrt (num)
if num % 1==0:
    print("It is a perfect square")
else:
    print("It is not a perfect square")

