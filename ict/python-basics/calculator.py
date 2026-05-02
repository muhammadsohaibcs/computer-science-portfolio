def sum(a,b):
    return (f"The sum of {a} and {b} = {a+b}")
def substraction(a,b):
    return (f"The substraction of {a} and {b} = {a-b}")
def multiply(a,b):
    return (f"The multiplication of {a} and {b} = {a*b}")
def divide(a,b):
    if b==0:
        return ("You cannot divide any number by zero")
    else:
        return (f"The divsion of {a} and {b} = {a/b}")
while True:
    try:
        num_1=eval (input("Enter first number :"))
        num_2=eval (input("Enter second number :"))
        while True:
            oper=input("Enter operation \"+\" or \"-\" or \"*\" or \"/\" :")
            if oper=="+" or oper=="-" or oper=="*" or oper=="/":
                break
            else:
                print("You have entered invalid operation")
                continue
        break
    except Exception as f:
        print("You have entered an invalid numbers")
        print(f)
        continue       
if oper=="+":
    print(sum(num_1,num_2))
if oper=="-":
    print(substraction(num_1,num_2))
if oper=="*":
    print(multiply(num_1,num_2))
if oper=="/":
    print(divide(num_1,num_2))