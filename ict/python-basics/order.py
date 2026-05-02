orders=[]
def new_order():
    order=(input("Input order ID : "),input("Input customer ID : "), input("Input product ID : "),input("Input Quanity : "))
    orders.append(order)
def check_order():
    order_ID = input("Enter the order ID number :")
    i=1
    for tup in orders:
        if tup[0]== order_ID:
            print(f"Order {i} details are found")
            print(tup)
            i=i+1
    if i > 1:
        print("No furthur Record found !!")       
    else:
        print("No Record found !!")
while True:
    print("Enter 1 for new order")
    print("Enter 2 for checking orders")
    print("Enter 3 to exit")
    number=int(input("Enter a number :"))
    if number==1:
        new_order()
    if number==2:
        check_order()
    if number==3:
        break
    

