nostrils(external_tubular).
live(at_sea).
bill(hooked).
bill(flat).
size(large).
wings(long_narrow).
color(dark).
color(white).
neck(long).
flight(ponderous).
voice(muffled_musical_whistle).
voice(loud_trumpeting).
feet(webbed).

bird(laysan_albatross) :-
    family(albatross),
    color(white).

bird(black_footed_albatross) :-
    family(albatross),
    color(dark).

bird(whistling_swan) :-
    family(swan),
    voice(muffled_musical_whistle).

bird(trumpeter_swan) :-
    family(swan),
    voice(loud_trumpeting).
order(tubenose) :-
    nostrils(external_tubular),
    live(at_sea),
    bill(hooked).

order(waterfowl) :-
    feet(webbed),
    bill(flat).

family(albatross) :-
    order(tubenose),
    size(large),
    wings(long_narrow).

family(swan) :-
    order(waterfowl),
    neck(long),
    color(white),
    flight(ponderous).
