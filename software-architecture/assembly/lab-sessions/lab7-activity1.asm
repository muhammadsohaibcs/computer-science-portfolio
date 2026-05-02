.MODEL SMALL
.STACK 100H

.DATA
    RESULT DW ?

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    ; Set values before calling procedure
    MOV AL, 6
    MOV BL, 7

    CALL MULTIPLY

    MOV RESULT, AX

    MOV AH, 4CH
    INT 21H
MAIN ENDP


MULTIPLY PROC
    MUL BL          ; AL × BL → AX
    RET
MULTIPLY ENDP

END MAIN