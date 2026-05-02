# def accending(my_list):
    # n=len(my_list)
    # for i in range( n):
    #     index_min=i
    #     for j in range(i+1,n):
    #         if my_list[j] < my_list[index_min]:
    #             index_min =j
    #     my_list[i], my_list[index_min]=my_list[index_min], my_list[i]
    # numbers.sort()

# numbers=[1,5,8,9,4,5.6,2]
# accending(numbers)
# print(numbers)
# s="asd gff"
# i=s.index(" ")
# print(s[-2:]+s[2:i]+s[i+1:-2]+s[:2])
# print("Helloword\rwe")
# s="mom"
# newstring=""
# for ch in s:
#     ch=ch.lower()
#     if s.isalnum:
#         newstring+=ch
# if newstring==newstring[::-1]:
#     print("True")
# else:
#     print("asd")
balance=3000
month=1
monthlypayment=85
while balance>=0:
    print("Month=",month)
    interest=.01*balance
    print(interest)
    balance= interest+balance
    print(balance)
    balance=balance-monthlypayment
    print(balance)
    month+=1






            

