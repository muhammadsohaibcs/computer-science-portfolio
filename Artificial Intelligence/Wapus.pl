safe(1,1).
safe(2,1).
safe(1,2).
safe(2,2).

visited(1,1).
visited(2,1).
visited(1,2).


breeze(2,1).
stench(1,2).

:- discontiguous pit/2.
:- discontiguous wumpus/2.
:- discontiguous breeze/2.
:- discontiguous stench/2.

adjacent(X,Y,X1,Y) :-
    between(1,4,X),
    between(1,4,Y),
    X1 is X+1,
    X1 =< 4.

adjacent(X,Y,X1,Y) :-
    between(1,4,X),
    between(1,4,Y),
    X1 is X-1,
    X1 >= 1.

adjacent(X,Y,X,Y1) :-
    between(1,4,X),
    between(1,4,Y),
    Y1 is Y+1,
    Y1 =< 4.

adjacent(X,Y,X,Y1) :-
    between(1,4,X),
    between(1,4,Y),
    Y1 is Y-1,
    Y1 >= 1.



possible_pit(X,Y) :-
    breeze(BX,BY),
    adjacent(BX,BY,X,Y),
    \+ safe(X,Y).



possible_wumpus(X,Y) :-
    stench(SX,SY),
    adjacent(SX,SY,X,Y),
    \+ safe(X,Y).


wumpus(X,Y) :-
    possible_wumpus(X,Y),
    \+ (
        possible_wumpus(X2,Y2),
        (X2 \= X ; Y2 \= Y)
    ).


pit(X,Y) :-
    possible_pit(X,Y),
    \+ (
        possible_pit(X2,Y2),
        (X2 \= X ; Y2 \= Y)
    ).
