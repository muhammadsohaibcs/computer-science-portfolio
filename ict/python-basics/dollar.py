pennies=int(input("Enter number of  pennies : "))
nicles=int(input("Enter number of  nicles :"))
dimes=int(input("Enter number of  dimes :"))
quaters=int(input("Enter number of  quaters :"))
dollar=(pennies/100) + (nicles/20) + (dimes/10) + (quaters/4)
if dollar==1:
    print("Congratulation!You have won the match")
elif dollar>1:
    print("The amount entered was more than one dollar")    
else:
    print("The amount entered was less than one dollar")    

