LEFT AT:
- radio IDs should be different for each input
- do answers and send them to nodejs server
THEN:  
- save answers in DB
- update numAnswers for each data point
- update numAnswers for each question
- update total numFormAnswers
- babel polyfill and test on browsers 
 
1) Remove default create form values that I set in the initial form for testing purposes
2) Reset clearing time to 5 min. Compare to 4 min otherwise we need 10 mins.
