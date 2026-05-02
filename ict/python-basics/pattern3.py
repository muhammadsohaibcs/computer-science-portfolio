# for i in range(5):
#     for k in range(1): 
#      print(" "*(5-i),end="")
#     for j in range(i+1,0,-1):
#         print(j,end=" ")
#     print()
l=[1,2,3]
u=234
k="1234512221"
print(k)
count=0
for i in k:
    y=k.count(i)
    if y>count:
        count=y
print(count)   