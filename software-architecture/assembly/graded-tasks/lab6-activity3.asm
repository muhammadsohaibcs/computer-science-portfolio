.MODEL SMALL
.STACK 100H

.DATA
MSG1      DB "Enter Password: $"
CORRECTPW DB "comsats"
USERPW    DB 5 DUP(?)

MSGOK     DB 13,10,"OK$"
MSGERR    DB 13,10,"ERROR$"

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX

    ; Display prompt
    LEA DX, MSG1
    MOV AH, 09H
    INT 21H

    ; Input password (hidden as *)
    MOV SI, OFFSET USERPW
    MOV CX, 5

INPUT_LOOP:
    MOV AH, 08H         ; input character without echo
    INT 21H

    MOV [SI], AL        ; store typed character
    INC SI

    ; display *
    MOV DL, '*'
    MOV AH, 02H
    INT 21H

    LOOP INPUT_LOOP

    ; Compare USERPW with CORRECTPW using CMPSB
    LEA SI, USERPW
    LEA DI, CORRECTPW
    MOV CX, 5
    CLD
    REPE CMPSB

    JZ PASSWORD_OK

PASSWORD_ERROR:
    LEA DX, MSGERR
    MOV AH, 09H
    INT 21H
    JMP EXIT

PASSWORD_OK:
    LEA DX, MSGOK
    MOV AH, 09H
    INT 21H

EXIT:
    MOV AH, 4CH
    INT 21H
MAIN ENDP

END MAIN