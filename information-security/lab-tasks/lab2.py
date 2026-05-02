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
    print(x , end='')

print("The max element in l1 is : " , max(l1))
print("The min element in l1 is : " , min(l1))


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
        
