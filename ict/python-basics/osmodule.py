# import os
# import shutil
# folder = "My folder"
# os.makedirs(folder, exist_ok=True)

# for i in range(1, 100):
#     name = "file" + str(i)  # Changed name formatting to include the index
#     with open(os.path.join(folder, name),'w+') as f:  
    
#         f.read()
# shutil.rmtree(folder)

# List = [[i for i in range(1, 6)] for j in range(1, 6)]
# v = 65
# for s in range(5):
#     for d in range(5):
#         List[s][d] = chr(v)
#         x= input("enter number")
#         if x==List[s][d]:
#             List[s][d]="D"
#         print(List[s][d],end=" | ")
#         v += 1
#     print()
#     print("-------------------")
  
        
# # List = [[ i for i in range(5)] for j in range(5)]
# # print(List)
# import random
# def num_check(name,num=6):
#     while num > 5 or num < 0  :
#         print("You have entered an invalid number")
#         if name=="numXR":
#             try:
#                 value = int(input(f"{player1} Enter row number and remember you have {X0}: "))
#                 if value>0 and value<6:
#                     num=value
#                     break
#                 else:
#                     continue
#             except Exception as f:
#                 print("Invalid Inputs")
#                 print(f)
#                 num_check("numXR")
#         elif name=="numXC":
#             try:
#                 value = int(input(f"{player1} Enter column number and remember you have {X0}: "))
#                 if value>0 and value<6:
#                     num=value
#                     break
#                 else:
#                     continue
#             except Exception as f:
#                 print("Invalid Inputs")
#                 print(f)
#                 num_check("numXC")
#         elif name=="num0R":
#             try:
#                 value = int(input(f"{player2} Enter row number and remember you have {Not_randomX0}: "))
#                 if value>0 and value<6:
#                     num=value
#                     break
#                 else:
#                     continue
#             except Exception as f:
#                 print("Invalid Inputs")
#                 print(f)
#                 num_check("num0R")
#         elif name=="num0C":
#             try:
#                 value = int(input(f"{player2} Enter column number and remember you have {Not_randomX0}: "))
#                 if value>0 and value<6:
#                     num=value
#                     break
#                 else:
#                     continue
#             except Exception as f:
#                 print("Invalid Inputs")
#                 print(f)
#                 num_check("num0C")
#         return num - 1                 
