.MODEL SMALL
.STACK 100H

.DATA
    STR1    DB "COMSATS UNIVERSITY ISLAMABAD$"
    RESULT  DB 50 DUP('$')

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    ; DX points to source string
    LEA DX, STR1

    ; AH = starting position
    MOV AH, 9

    ; AL = length
    MOV AL, 10

    CALL SUBSTRING

    ; Print the substring
    MOV AH, 09H
    INT 21H

    MOV AH, 4CH
    INT 21H
MAIN ENDP


; -----------------------------
; SUBSTRING PROCEDURE
; INPUT:
;   DX = address of string
;   AH = starting position
;   AL = length
; OUTPUT:
;   DX = address of RESULT
; -----------------------------
SUBSTRING PROC
    MOV SI, DX          ; SI points to source string
    LEA DI, RESULT      ; DI points to result string

    MOV BL, AH
    DEC BL              ; convert to index
    ADD SI, BX          ; move SI to starting position

    MOV CL, AL          ; length of substring

COPY_LOOP:
    MOV DL, [SI]        ; copy character
    MOV [DI], DL

    INC SI
    INC DI
    LOOP COPY_LOOP

    MOV BYTE PTR [DI], '$'   ; end result with $

    LEA DX, RESULT      ; DX points to substring
    RET
SUBSTRING ENDP

END MAIN