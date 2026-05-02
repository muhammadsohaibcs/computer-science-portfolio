a = int(input ("Enter a number : "))
while (a>0):
    print(a%10 , end="")
    a=(int)(a/10)
print("\n =======================================================")



c=d = 0
while True:
    b = int(input ("Enter a number and press 999 to terminate: "))
    if (b==999):
        break
    if b%2==0:
        c+= b
    else:
        d+=b
print ("The sum of even numbers is " , c)
print ("The sum of odd numbers is " , d)
print("\n =======================================================")




e = int(input ("How many fibonacii numbers do yo want "))
f=2
f0 =0 
f1 = 1
print(f0)
print(f1)
f=2
while  (f<e) :
    f2 = f0+f1
    print(f2)
    f0=f1
    f1= f2
    f+=1
print("\n =======================================================")



g = int(input ("Enter your marks : "))
if (g>100 or g <0):
    print("Invalid marks")
elif g >90:
    print ("Grade A")
elif g >80:
    print ("Grade B")
elif g >70:
    print ("Grade C")
elif g >60:
    print ("Grade D")
elif g >50:
    print ("Grade E")
else:
    print ("Grade F")
print("\n =======================================================")





   
g = int(input ("Enter number for factorial : ")) 
def factorial ( n):
    if n ==1:
        return 1
    if n < 0:
        return 0
    
    return n * factorial(n-1)

print ("The factorial of " , g , "is" + factorial(5))
print("\n =======================================================")