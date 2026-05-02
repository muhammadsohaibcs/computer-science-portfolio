while True:
    try:
        num=int(input("Enter a number: "))
        break
    except Exception:
        print("You have enterd Invalid Input!!!")
        continue
f1=0
f2=1

if num ==1:
        print(f1)        
elif num==2:
        print(f1)
        print(f2)
    
else:
        x=3
        print(f1)
        print(f2)
        while x<=num:
            f3=f1+f2
            f1=f2
            f2=f3
            print(f3)
            x+=1
        
