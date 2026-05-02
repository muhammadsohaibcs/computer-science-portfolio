def get_size():
    d = 0
    temp_number = number 
    while temp_number > 0:
        temp_number = temp_number // 10
        d += 1
    return d
def prefix_get_size():
    temp_number = number // 10**(d-2)
    if temp_number == 37 or temp_number // 10 == 4 or temp_number // 10 == 5 or temp_number // 10 == 6:
        return True
    else:
        return False
def get_digit():
    return 13 <= d <= 16
def sum_of_odd_place():
    temp_number = number 
    t=d
    sum_odd = 0
    while t > 0:
        digit = temp_number % 10
        sum_odd += digit
        temp_number = temp_number // 100 
        t-= 2
    return sum_odd
def sum_of_even_place():
    temp_number = number // 10  
    sum_even = 0
    t=d
    while t > 0:
        digit = temp_number % 10
        double = 2 * digit
        if double > 9:
            double = double - 9 
        sum_even += double
        temp_number = temp_number // 100
        t -= 2
    return sum_even
def is_valid():
    total_sum = sum_even + sum_odd
    return total_sum % 10 == 0
number = int(input("Enter the card number: "))
d = get_size()
if prefix_get_size():
    if get_digit():
        sum_odd = sum_of_odd_place()
        sum_even = sum_of_even_place()
        if is_valid():
            print("You have entered a valid card number")
        else:
            print("You have entered an invalid card number")
    else:
        print("You have entered an invalid card number")
else:
    print("You have entered an invalid card number")
