 
.MODEL SMALL 
 
.STACK 100h 
 
.DATA 
 
A   DW 2 
B   DW 5 
SUM DW ?  
 
.CODE 
      
MAIN  PROC 
 MOV AX, @DATA ;INITIALIZE DATA SEGMENT 
 MOV DS, AX   
;-------------------------------------------------------- 
  
 MOV AX, A 
 ADD AX, B 
 INC AX 
 MOV SUM, AX 
;-------------------------------------------------------- 
        MOV     AH, 4Ch         ;RETURN CONTROL TO THE 
OPERATING SYSTEM 
        INT     21h 
MAIN ENDP     
END    MAIN 