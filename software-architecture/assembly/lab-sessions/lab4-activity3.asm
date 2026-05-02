TITLE LAB4_3 program GRADE 
.MODEL SMALL 
.STACK 100h 
.DATA 
    marks DW 70                ; Variable to hold marks 
    msgGradeA DB 'Grade: A$' 
    msgGradeB DB 'Grade: B$' 
    msgGradeC DB 'Grade: C$' 
    msgGradeF DB 'Grade: F$' 
    newline   DB 13, 10, '$'    ; Newline for output 
.CODE 
MAIN PROC 
    ; Initialize the data segment 
    MOV AX, @DATA 
    MOV DS, AX ; Check the marks and determine the grade 
    MOV AX, marks          ; Move marks into AX for comparison 
    ; Check for Grade A 
    CMP AX, 80 
    JG PrintGradeA         ; Jump to Grade A if marks > 80 
    ; Check for Grade B 
    CMP AX, 65 
    JG PrintGradeB         ; Jump to Grade B if marks > 65 
    ; Check for Grade C 
    CMP AX, 50 
    JGE PrintGradeC        ; Jump to Grade C if marks >= 50 
    JMP PrintGradeF 
PrintGradeA: 
    MOV DX, OFFSET msgGradeA 
    JMP PrintGrade 
PrintGradeB: 
    MOV DX, OFFSET msgGradeB 
    JMP PrintGrade 
PrintGradeC: 
    MOV DX, OFFSET msgGradeC 
    JMP PrintGrade 
PrintGradeF: 
    MOV DX, OFFSET msgGradeF 
PrintGrade: 
    MOV AH, 09h 
    INT 21h 
    MOV DX, OFFSET newline 
    MOV AH, 09h 
    INT 21h 
    MOV AX, 4C00h          ; Terminate program 
    INT 21h 
 
MAIN ENDP 
END MAIN 
