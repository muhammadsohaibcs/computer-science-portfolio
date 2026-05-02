.MODEL SMALL
.STACK 100H

.DATA
    ARR     DB 5,3,8,1,4
    ARRSIZE DB 5

    SUM     DW ?
    AVG     DB ?

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    ; -----------------------------
    ; Call SumArray
    ; -----------------------------
    LEA SI, ARR
    MOV CL, ARRSIZE
    CALL SUMARRAY
    MOV SUM, AX

    ; -----------------------------
    ; Call AverageArray
    ; -----------------------------
    LEA SI, ARR
    MOV CL, ARRSIZE
    CALL AVERAGEARRAY
    MOV AVG, AL

    ; -----------------------------
    ; Call SortArray
    ; -----------------------------
    LEA SI, ARR
    MOV CL, ARRSIZE
    CALL SORTARRAY

    ; End Program
    MOV AH, 4CH
    INT 21H
MAIN ENDP


; =====================================
; PROCEDURE: SUMARRAY
; INPUT:
;   SI = address of array
;   CL = number of elements
; OUTPUT:
;   AX = sum of array
; =====================================
SUMARRAY PROC
    MOV AL, 0
    MOV AH, 0

SUM_LOOP:
    MOV BL, [SI]
    ADD AL, BL
    INC SI
    DEC CL
    JNZ SUM_LOOP

    RET
SUMARRAY ENDP


; =====================================
; PROCEDURE: AVERAGEARRAY
; INPUT:
;   SI = address of array
;   CL = number of elements
; OUTPUT:
;   AL = average of array
; =====================================
AVERAGEARRAY PROC
    MOV AL, 0
    MOV AH, 0
    MOV BL, CL

AVG_LOOP:
    MOV DL, [SI]
    ADD AL, DL
    INC SI
    DEC CL
    JNZ AVG_LOOP

    MOV AH, 0
    DIV BL

    RET
AVERAGEARRAY ENDP


; =====================================
; PROCEDURE: SORTARRAY
; INPUT:
;   SI = address of array
;   CL = number of elements
; OUTPUT:
;   Array sorted in ascending order
; =====================================
SORTARRAY PROC
    MOV CH, CL

OUTER_LOOP:
    MOV CL, CH
    DEC CL
    LEA SI, ARR

INNER_LOOP:
    MOV AL, [SI]
    MOV BL, [SI+1]

    CMP AL, BL
    JBE NO_SWAP

    ; Swap elements
    MOV [SI], BL
    MOV [SI+1], AL

NO_SWAP:
    INC SI
    LOOP INNER_LOOP

    DEC CH
    JNZ OUTER_LOOP

    RET
SORTARRAY ENDP

END MAIN