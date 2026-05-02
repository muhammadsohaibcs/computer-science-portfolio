.MODEL SMALL
.STACK 100H

.DATA
    STR1        DB "Madam$"
    REVSTR      DB 50 DUP('$')
    PALMSG      DB "Palindrome$"
    NOTPALMSG   DB "Not Palindrome$"

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    ; -----------------------------
    ; a) toUpperString
    ; -----------------------------
    LEA DX, STR1
    CALL TOUPPER

    ; Print uppercase string
    LEA DX, STR1
    MOV AH, 09H
    INT 21H

    ; New line
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H
    MOV DL, 0AH
    INT 21H

    ; -----------------------------
    ; b) toLowerString
    ; -----------------------------
    LEA DX, STR1
    CALL TOLOWER

    ; Print lowercase string
    LEA DX, STR1
    MOV AH, 09H
    INT 21H

    ; New line
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H
    MOV DL, 0AH
    INT 21H

    ; -----------------------------
    ; c) ReverseString
    ; -----------------------------
    LEA DX, STR1
    CALL REVERSESTRING

    ; Print reversed string
    LEA DX, REVSTR
    MOV AH, 09H
    INT 21H

    ; New line
    MOV DL, 0DH
    MOV AH, 02H
    INT 21H
    MOV DL, 0AH
    INT 21H

    ; -----------------------------
    ; d) IsPalindrome
    ; -----------------------------
    LEA DX, STR1
    CALL ISPALINDROME

    CMP AL, 1
    JE PALIN

    LEA DX, NOTPALMSG
    MOV AH, 09H
    INT 21H
    JMP ENDMAIN

PALIN:
    LEA DX, PALMSG
    MOV AH, 09H
    INT 21H

ENDMAIN:
    MOV AH, 4CH
    INT 21H
MAIN ENDP


; =========================================
; PROCEDURE: TOUPPER
; INPUT: DX = address of string
; OUTPUT: same string converted to uppercase
; =========================================
TOUPPER PROC
    MOV SI, DX

UP1:
    MOV AL, [SI]
    CMP AL, '$'
    JE DONE1

    CMP AL, 'a'
    JB SKIP1
    CMP AL, 'z'
    JA SKIP1

    SUB AL, 32
    MOV [SI], AL

SKIP1:
    INC SI
    JMP UP1

DONE1:
    RET
TOUPPER ENDP


; =========================================
; PROCEDURE: TOLOWER
; INPUT: DX = address of string
; OUTPUT: same string converted to lowercase
; =========================================
TOLOWER PROC
    MOV SI, DX

LOW1:
    MOV AL, [SI]
    CMP AL, '$'
    JE DONE2

    CMP AL, 'A'
    JB SKIP2
    CMP AL, 'Z'
    JA SKIP2

    ADD AL, 32
    MOV [SI], AL

SKIP2:
    INC SI
    JMP LOW1

DONE2:
    RET
TOLOWER ENDP


; =========================================
; PROCEDURE: REVERSESTRING
; INPUT: DX = address of string
; OUTPUT: reversed string stored in REVSTR
; =========================================
REVERSESTRING PROC
    MOV SI, DX
    LEA DI, REVSTR

    ; Find end of string
FIND_END:
    MOV AL, [SI]
    CMP AL, '$'
    JE BACK_ONE
    INC SI
    JMP FIND_END

BACK_ONE:
    DEC SI

COPY_REV:
    CMP SI, DX
    JB REV_DONE

    MOV AL, [SI]
    MOV [DI], AL
    DEC SI
    INC DI
    JMP COPY_REV

REV_DONE:
    MOV BYTE PTR [DI], '$'
    RET
REVERSESTRING ENDP


; =========================================
; PROCEDURE: ISPALINDROME
; INPUT: DX = address of string
; OUTPUT: AL = 1 if palindrome, AL = 0 otherwise
; =========================================
ISPALINDROME PROC
    MOV SI, DX
    MOV DI, DX

    ; Find end of string
FIND_LAST:
    MOV AL, [DI]
    CMP AL, '$'
    JE SET_LAST
    INC DI
    JMP FIND_LAST

SET_LAST:
    DEC DI

CHECK_PAL:
    CMP SI, DI
    JAE YES_PAL

    MOV AL, [SI]
    MOV BL, [DI]
    CMP AL, BL
    JNE NO_PAL

    INC SI
    DEC DI
    JMP CHECK_PAL

YES_PAL:
    MOV AL, 1
    RET

NO_PAL:
    MOV AL, 0
    RET
ISPALINDROME ENDP

END MAIN