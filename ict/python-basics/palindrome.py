def palindrome(string):
    if isinstance(string,str):
        new_string=" "
        for char in string:
            char.lower()
            if char.isalnum():
                new_string=new_string+char
    return new_string==new_string[::-1]
a_string=input("Enter a string: ")
if palindrome(a_string):
    print("It is a palindrome")
else:
    print("It is not a palindrome ")
    
