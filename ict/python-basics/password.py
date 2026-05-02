# password=input("Enter your password :")
# def check_password():
#     if len(password) < 8:
#         return False
#     if  not password.isalnum():    
#         return False

#     total_digits=0
#     for digit in password:
#         if digit.isdigit():
#             total_digits+=1
#     if total_digits<2:
#                 return False
            
#     return True
# if check_password():
#     print("you have entered a valid password")
# else:
#     print("You have entered an invalid password")
from datetime import datetime

def calculate_age(birth_date):
    today = datetime.today()
    
    # Calculate the difference in years, months, and days
    years = today.year - birth_date.year
    months = today.month - birth_date.month
    days = today.day - birth_date.day
    
    # Adjust if the current date is before the birthday this year
    if days < 0:
        months -= 1
        days += (birth_date.replace(year=today.year, month=today.month) - birth_date.replace(year=today.year, month=today.month - 1)).days
        
    if months < 0:
        years -= 1
        months += 12

    return years, months, days

def main():
    # Input date of birth
    dob_input = input("Enter your date of birth (YYYY-MM-DD): ")
    birth_date = datetime.strptime(dob_input, "%Y-%m-%d")
    
    # Calculate age
    years, months, days = calculate_age(birth_date)
    
    # Display the result
    print(f"Your age is {years} years, {months} months, and {days} days")

if __name__ == "__main__":
    main()

