.MODEL SMALL
.STACK 100H

.DATA
a DB 7
b DB 3
c1 DB 4
d DB ?

t1 DB ?
t2 DB ?
four DB 4

msg DB 'Result stored in variable d $'

.CODE
MAIN PROC

MOV AX, @DATA
MOV DS, AX

; -------- b^2 --------
MOV AL, b
MOV BL, b
MUL BL
MOV t1, AL

; -------- a*c --------
MOV AL, a
MOV BL, c1
MUL BL

; -------- 4ac --------
MOV BL, four
MUL BL
MOV t2, AL

; -------- b^2 - 4ac --------
MOV AL, t1
SUB AL, t2
MOV d, AL

; print message
MOV AH, 09H
LEA DX, msg
INT 21H

; exit program
MOV AH, 4CH
INT 21H

MAIN ENDP
END MAIN