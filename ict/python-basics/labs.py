# name=input("Enter a word :")
# # first_letter=name[0]
# # name=name.replace(first_letter,"z")
# # print(name)
# name=name[1::2]
# print(name)
# word=" "
# k= True
# while k:
#     word=input("Enter a string")
#     if "," in word:
#         k=False
#     else:
#         print("You have entered an Invalid number")
#         k=True
# first_two=word[:2]
# Last_two=word[-2:]
# print(first_two)
# print(Last_two)
# word=word.replace(first_two,Last_two) and word.replace(Last_two,first_two) and word.replace( ","," ")
# print(word)

# a=input("Enter a string")
# length=len(a)
# x=0
# while x<length:
#     if x ==1 or x== 4 or x== 5:
#         x+=1
#         continue       
#     else:
#         print(a[x])
#         x+=1
# x=1
# while True:
#     print(x)
#     x+=1
# x=1
# while x<=100:
#     if x%2==0:
#         print(x)
#     else:
#         x+=1
#         continue
# x= eval(input("ERTYU"))
# print(x)
# def df(x):
#     xy=x
#     xy.lo
# Play_again=input("Do you want to play again ? if Yes write y if No write n :").upper()
# print(Play_again)
# List = [[" " for i in range(5)] for j in range(5)]

# y= all(List[i][j]==" " for j in range(5) for i in range(5))
# print(y)
# def large(num1,num2,num3,num4):
#     if num1 >= num2 and num1 >= num3 and num1>=num4:
#         return num1
#     if num3 >= num1 and num3 >= num2 and num3>=num4:
#         return num3
#     if num2 >= num1 and num2 >= num3 and num2>=num4:
#         return num2
#     if num4 >= num1 and num4 >= num2 and num4>=num2:
#         return num4
# print(large(2,6,6,2))
# f1=0
# F2=1
# for i in range (10):
#         f3=f1+F2
#         f1=F2                                                                                                           
#         F2=f3
#         print(f3)
def print_custom_pascals_triangle(n):
    for i in range(n):
        # Print leading spaces for alignment
        print(' ' * (n - i - 1)*2, end=' ')
        
        value = 1
        for j in range(i + 1):
            # Print the current value
            print(f"{value:3}", end=' ')
            # Update the value for the next position
            value *= 2
        value //= 4        
        for j in range(i):
            # Print the current value
            print(f'{value:3}', end=' ')
            # Update the value for the next position
            value //=2
        print()

# Example usage:
print_custom_pascals_triangle(10)
import math

def calculate_area(shape='rectangle', **kwargs):
    if shape == 'rectangle':
        return kwargs.get('length', 1) * kwargs.get('width', 1)
    elif shape == 'square':
        side = kwargs.get('side', 1)
        return side * side
    elif shape == 'circle':
        radius = kwargs.get('radius', 1)
        return math.pi * radius * radius
    elif shape == 'triangle':
        base = kwargs.get('base', 1)
        height = kwargs.get('height', 1)
        return 0.5 * base * height
    else:
        raise ValueError("Unsupported shape type")

# Example usage:
print(calculate_area())  # Default rectangle, should use length=1, width=1 and return 1
print(calculate_area(shape='rectangle', length=5, width=4))  # Should return 20
print(calculate_area(shape='square', side=3))  # Should return 9
print(calculate_area(shape='circle', radius=2))  # Should return 12.566370614359172 (approx)
print(calculate_area(shape='triangle', base=6, height=3))  # Should return 9
def print_pascals_triangle(n):

    for i in range(n):
        value = 1
        # Print leading spaces for alignment
        print(' ' * (n - i - 1), end='')
        for j in range(i + 1):
            print(f'{value:2}', end=' ')
            value = value * (i - j) // (j + 1)
        print()

# Example usage:
print_pascals_triangle(5)
