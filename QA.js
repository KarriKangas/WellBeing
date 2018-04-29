var QA = function() {

}
QA.answer = {

    category: 1, // (which category)
    answer: 5, // (what was the answer)
    weight: 0.5, // (weight of questions answered)
    previousAnswers: 18, //(Amount of previous answers)
    category0WBI: 80.0, // (The index of category 0)
    category1WBI: 80.0, // (The index of category 1)
    category2WBI: 90.0, // (The index of category 2)
    category3WBI: 40.0, // (The index of category 3)
    category4WBI: 56.0, // (The index of category 4)
    category5WBI: 78.0, // (The index of category 5)
    totalWBI: 78.4 // (The total wbi)

};
QA.question = {
    new_answer: function(answer) {
        var weight0 = 0.1;
        var weight1 = 0.2;
        var weight2 = 0.15;
        var weight3 = 0.2;
        var weight4 = 0.2;
        var weight5 = 0.15; //WEIGHTS for different categoryWBI when calculating tatalWBI

        //answer.previousAnswers=answer.previousAnswers+1;  // amount of previous answers+1
        //var score="answer.category"+answer.category+"WBI";
        var score = eval("answer.category" + answer.category + "WBI") + (answer.answer * 20 - eval("answer.category" + answer.category + "WBI")) * answer.weight;
        eval("answer.category" + answer.category + "WBI=score");
        //eval("answer.category"+answer.category+"WBI")=eval("answer.category"+answer.category+"WBI")+(answer.answer*20-eval("answer.category"+answer.category+"WBI"))*answer.weight;
        answer.totalWBI = answer.category0WBI * weight0 + answer.category1WBI * weight1 + answer.category3WBI * weight3 + answer.category4WBI * weight4 + answer.category2WBI * weight2 + answer.category5WBI * weight5;
        return answer;
    }
};


module.exports = QA;