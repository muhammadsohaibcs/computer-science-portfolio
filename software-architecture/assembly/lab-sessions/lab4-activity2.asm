TITLE Lab4_2  PRINT ASCII CHARS 
.MODEL SMALL 
.STACK 100h 
.DATA 
    newline DB 13, 10, '$'   
.CODE 
MAIN PROC 
    MOV AX, @DATA 
    MOV DS, AX 

    ; Print ASCII characters from 0 to 127 
    MOV CX, 26 
    MOV AL, 65
    PrintLoop:  
    ; Set the loop counter to 128 (for ASCII 0-127) 
    MOV DL,AL
    MOV AH, 02h         ; Function to print a character 
    INT 21h   
    INC AL            ; Start with AL = 0 
    LEA DX, newline          ; Move character to DL for printing 
    MOV AH, 09h         ; Function to print a character 
    INT 21h  
    LOOP PrintLoop  
    
    MOV AX, 4C00h           ; Terminate program 
    INT 21h 
MAIN ENDP 
END MAIN