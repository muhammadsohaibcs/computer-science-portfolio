l1 = []
num1 = int(input("Enter the number of elements in list 1 :"))
for x in range(num1):
    print (f'Enter the {x+1} Element: ')
    l1.append(int(input()))

l2 = []
num2 = int(input("Enter the number of elements in list 2 : "))
for x in range(num2):
    print (f'Enter the {x+1} Element: ')
    l2.append(int(input()))
l1.extend(l2)
l1.sort()
for x in l1:
    print(x , end=' ')


print("The max element in l1 is : " , max(l1))
print("The min element in l1 is : " , min(l1))

from math import sin, cos, pi

def numerical_derivative(h):
    x_vals = []
    val = -pi
    while val <= pi:
        x_vals.append(val)
        val += 0.001

    results = []
    for x in x_vals:
        approx = (sin(x + h) - sin(x)) / h
        actual = cos(x)
        results.append((x, approx, actual))
    
    comparison = {round(x, 3): (round(approx, 6), round(actual, 6)) for x, approx, actual in results}
    
    return  comparison

for h in [0.001, 0.01, 0.1]:
    comparison = numerical_derivative(h)
    
    print(f"\n=== Results for h = {h} ===")
    count = 0
    for x in comparison:
        print(f"x = {x}, Numerical = {comparison[x][0]}, cos(x) = {comparison[x][1]}")
        count += 1
        if count == 5:
            break


dic ={
    "Sohaib":{
        "Birthday" : "1/01/2005"
    },
    "Zain":{
        "Birthday" : "1/01/2005"
    },
    "Waqar":{
        "Birthday" : "1/01/2005"
    }
    
}
print ("Welcome to Birthday dictionary. we know the birthday of :")
for x in dic:
    print(x)
   

a = input("Who's birthday do you want to look up? :")
for x, obj in dic.items():
    if x==a:
        for key in obj:
            print (a ,  "=", obj[key])
            
dict ={
    'name':'Sohaib',
    "age": 20,
    "salary":2300000000,
    "city":'Koh e Suleiman'   
}
newdict={}
while True:
        c = input("Enter keys name to seperate and press 999 to exit: ")
        if c=="999":
            break
        for key in dict:
            if key==c:
                newdict[key] = dict[key]
                print("Added Successfully")
            
for key in newdict:
    print(key ,"=", newdict[key])