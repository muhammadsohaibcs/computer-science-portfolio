
def length( a):
    x=0
    while (a>0):
        x+=1
        a=(int)(a/10)
    return x
a = int(input ("Enter a number : "))
if (a%2==0):
    while (a>0):
        print(a%10 , end="")
        a=(int)(a/10)
else:
    x = int((length(a))/2)
    y=0
    while (a>0):
        if (y==x):
            a=(int)(a/10)
            y+=1
            continue
        print(a%10 , end="")
        a=(int)(a/10)
        y+=1
