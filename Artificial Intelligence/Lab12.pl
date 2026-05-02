parent(allahbux1 , sohaib).
parent(allahbux1 , waqar).
parent(sharfuldin , allahbux1).
parent(sharfuldin , gm).
parent(sharfuldin , miqbal).
parent(sharfuldin , farooqahemd).
parent(allahbux2 , sharfuldin).
parent(kamaluldin, allahbux2).

grandParent(X,Y) :- parent(X,Z) , parent(Z,Y), write(Y) , write(' is the grandson of ') , write(X), nl.
brother(X,Y) :- parent(Z,X) ,  parent(Z,Y) , X\=Y.
uncle(X,Y) :- parent(Z,Y) , brother(X,Z) , write(X) , write(' is the uncle of ') , write(Y), nl.

series(R1, R2, R) :- R is R1 + R2.

parallel(R1, R2, R) :- R is (R1 * R2) / (R1 + R2).

equivalent(R) :-
    parallel(10, 40, R3),
    series(R3, 12, R4),
    parallel(R4, 30, R), write(R),write("ohm"), nl.

inside(b2, b1).
inside(b5, b1).

inside(b3, b2).
inside(b4, b2).

inside(b6, b5).

inside(b7, b6).

encloses(X, Y) :- inside(Y, X).
encloses(X, Y) :- inside(Z, X) , encloses(Z, Y).
