
% -------------------- DISEASE RULES --------------------

disease(P, tuberculosis) :-
    symptom(P, persistent_cough),
    symptom(P, constant_fatigue),
    symptom(P, weight_loss),
    symptom(P, lack_of_appetite),
    symptom(P, fever),
    symptom(P, coughing_blood),
    symptom(P, night_sweats).

disease(P, pneumonia) :-
    symptom(P, cough),
    symptom(P, fever),
    symptom(P, shaking_chills),
    symptom(P, shortness_of_breath).

disease(P, byssinosis) :-
    symptom(P, chest_tightness),
    symptom(P, cough),
    symptom(P, wheezing).

/*disease(P, pertussis) :-
    symptom(P, runny_nose),
    symptom(P, mild_fever).

disease(P, pneumoconiosis) :-
    symptom(P, chronic_cough),
    symptom(P, shortness_of_breath).

disease(P, sarcoidosis) :-
    symptom(P, dry_cough),
    symptom(P, shortness_of_breath),
    symptom(P, mild_chest_pain),
    symptom(P, scaly_rash),
    symptom(P, fever),
    symptom(P, red_bumps_on_legs),
    symptom(P, sore_eyes),
    symptom(P, swollen_ankles).

disease(P, asbestosis) :-
    symptom(P, chest_tightness),
    symptom(P, shortness_of_breath),
    symptom(P, chest_pain),
    symptom(P, lack_of_appetite).

disease(P, asthma) :-
    symptom(P, wheezing),
    symptom(P, cough),
    symptom(P, chest_tightness),
    symptom(P, shortness_of_breath).

disease(P, bronchiolitis) :-
    symptom(P, wheezing),
    symptom(P, fever),
    symptom(P, blue_skin),
    symptom(P, rapid_breath).

disease(P, influenza) :-
    symptom(P, headache),
    symptom(P, fever),
    symptom(P, shaking_chills),
    symptom(P, nasal_congestion),
    symptom(P, runny_nose),
    symptom(P, sore_throat).

disease(P, lung_cancer) :-
    symptom(P, cough),
    symptom(P, fever),
    symptom(P, hoarseness),
    symptom(P, chest_pain),
    symptom(P, wheezing),
    symptom(P, weight_loss),
    symptom(P, lack_of_appetite),
    symptom(P, coughing_blood),
    symptom(P, headache),
    symptom(P, shortness_of_breath).
*/
% -------------------- SYMPTOMS / QUESTIONS --------------------
:- dynamic known/2.

symptom(_, Symptom) :-
    ask(Symptom).

ask(Symptom) :-
    known(Symptom, yes).

ask(Symptom) :-
    known(Symptom, no), fail.

ask(Symptom) :-
    nl, write('Does the patient have '), write(Symptom), write(' (y/n)? '),
    read(Ans),
    (
        Ans == y -> assertz(known(Symptom, yes));
        assertz(known(Symptom, no)), fail
    ).

% -------------------- DIAGNOSIS --------------------

diagnose :-
    nl, write('Diagnosing...'), nl,
    disease(_, D), 
    nl, write('The patient most likely has: '), write(D), nl.

diagnose :-
    nl, write('No matching disease found.'), nl.

% -------------------- START --------------------

start :-
    retractall(known(_, _)),
    diagnose.
