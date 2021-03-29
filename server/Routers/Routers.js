var express = require("express");
var router = express.Router();

const { GetQuestions } = require("./QuestionsQuery/QuestionsQuery");
const { t } = require("./token");

/*
    Retrieves a list of questions for a particular product. 
    This list does not include any reported questions.
*/

router.get("/questions/:product_id/:page/:count", GetQuestions);

/*
    Returns answers for a given question. 
    This list does not include any reported answers.
*/

router.get("/questions/:question_id/answers");

/* 
    Adds a question for the given product
*/

router.post("/questions");

/*
    Adds an answer for the given question
*/

router.post("/questions/:question_id/answers");

/*
    Report Question
    Updates a question to show it was reported. Note, this action does not delete the question,
    but the question will not be returned in the above GET request.
*/

router.put("/questions/:question_id/report");

/*

Mark Answer as Helpful
Updates an answer to show it was found helpful.

*/

router.put("/answers/:answer_id/helpful");

/*
Report Answer
 Updates an answer to show it has been reported. Note,
 this action does not delete the answer, 
 but the answer will not be returned in the above GET request.
*/

router.put("/answers/:answer_id/report");

// router.get("/loaderio-07ff36c26ccd9ffc086268455547f317", t);

module.exports.router = router;
