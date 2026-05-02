contacts={
    "SOHAIB":{
        "Phone_No" : "+923237884167" ,
        "Email" : "abc@gmail.com" ,
        "Adresss" :  "asdfg"
          },
    "WAQAR":{
        "Phone_No" : "+923245641" ,
        "Email":" abcdfg@gmail.com" ,
        "Adresss" :  "aasdfsdfg"
          }
            }
def user():
    print("Enter 1 to see all contacts :")
    print("enter 2 to search details by name :")
    print("Enter 3 number to add a person details :")
    print("Enter 4 number to exit :")
while True:
    user()
    number=int(input("Enter a number: "))
    if number==1:
        print("Press 1 for complete details :")
        print("Press 2 for person Phone number :")
        digit=int(input("Enter 1 or 2 :"))
        for i in contacts:
            if digit ==1:
                print(i,contacts[i])
            if digit==2:
                print(i,contacts[i]["Phone_No"])
    if number ==2:
        name=input("Enter the person name :").upper()
        print(contacts[name])
    if number==3:
        name=input("Input person name :"). upper()
        new={
        "Phone_No" : input("Enter his phone no :") ,
        "Email": input("Enter his gmail :") ,
        "Adresss" : input("Enter his Address :")
        }
        
        contacts[name]=new
    if number==4:
        break
print("Thanks for visting")