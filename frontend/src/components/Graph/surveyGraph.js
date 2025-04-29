import React, { useMemo, useEffect, useState, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function SurveyGraph({ patientId, theme, setFilterType, setFilteredQuestions, setSelectedQuestion, setSelectedQuestionId }) {
  const [surveyData, setSurveyData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [reactionData, setReactionData] = useState([]);
  const [selectedQuestion, setSelectedQuestionLocal] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRange, setIsRange] = useState(false);
  const [isQuestionSelected, setIsQuestionSelected] = useState(false);
  const [filterType, setLocalFilterType] = useState("all");
  const chartRef = useRef(null);
  const [optionQuestions, setOptionQuestion] = useState([]);
  const [checkboxQuestions, setCheckboxQuestion] = useState([]);
  const [isOption, setIsOption] = useState(false);
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [isText, setIsText] = useState(false);
  const [filteredQuestions, setFilteredQuestionsLocal] = useState([]);
  const [questionLimitResponse, setQuestionLimitResponse] = useState([]);

  const uniqueQuestions = surveyData.filter(
    (item, index, self) =>
      self.findIndex((q) => q.question === item.question) === index
  );


  useEffect(() => {
    const fetchDataForPatient = async () => {
      try {
        const optionResponse = await axios.get(`http://localhost:5001/api/question_options/${patientId}`);
        const optionData = optionResponse.data;
        setOptionQuestion(optionData);

        const checkboxResponse = await axios.get(`http://localhost:5001/api/question_checkboxes/${patientId}`);
        const checkboxData = checkboxResponse.data;
        setCheckboxQuestion(checkboxData);

        const surveyResponse = await axios.get(`http://localhost:5001/api/patients/${patientId}/answers_14_days`);
        console.log(surveyResponse.data, "surveyResponse.data from SurveyGraph");
        const surveyData = surveyResponse.data;

        const filteredData = surveyData.filter(
          (item) => item.question !== "No data" && item.answer !== "N/A"
        );


        const days = Array.from({ length: filteredData.length }, (_, index) => ({
          day: `Day ${index + 1}`,
          answer: filteredData[index] || 0,
        }));

        const processedQuestions = filteredData.map((item, index) => {
          const isOption = optionData.find(option => option.answer === item.answer);
          const isCheckbox = checkboxData.find(check => check.question === item.question);
          if (item.question.includes("0 =")) {
            const type = "range";
            const questionWithoutScale = item.question.split("0 =")[0].trim();
            return {
              ...item,
              question: questionWithoutScale,
              day: days[index]?.day,
              type,
            };
          } else if (isOption) {
            const type = "option";
            return {
              ...item,
              day: days[index]?.day,
              type,
            };
          } else if (isCheckbox) {
            const type = "checkbox";
            return {
              ...item,
              day: days[index]?.day,
              type,
            };
          } else {
            const type = "textField";
            return {
              ...item,
              day: days[index]?.day,
              type,
            };
          }
        }).filter(Boolean);

        setLabels(processedQuestions.map((item) => item.answer));
        setSurveyData(processedQuestions);
      } catch (err) {
        console.error("Error fetching data for patient:", err);
      }
    };

    if (patientId) {
      fetchDataForPatient();
    }
    console.log(patientId, "patientId from SurveyGraph");
  }, [patientId]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const chartCanvas = document.getElementById("surveyGraph");
    const data = {
      labels: isQuestionSelected
        ? Array.from({ length: reactionData.length }, (_, i) => `Day ${i + 1}`)
        : surveyData.map((item) => item.answer),
      datasets: [
        {
          label: "",
          data: reactionData,
          borderColor: "#FF0000",
          backgroundColor: "#FF0000",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const question = surveyData[index]?.question;
                const answer = surveyData[index]?.answer;
                return `Question: ${question}, Answer: ${answer}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Days",
            },
          },
          y: {
            title: {
              display: true,
              text: "Reaction (0 to 10)",
            },
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    chartRef.current = new Chart(chartCanvas, config);
  }, [labels, reactionData, surveyData, isQuestionSelected, selectedQuestion]);

  useEffect(() => {
    return () => {
      setSurveyData([]);
      setLabels([]);
      setReactionData([]);
      setIsRange(false);
      setIsOption(false);
      setIsCheckbox(false);
      setIsQuestionSelected(false);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const filtered = uniqueQuestions
      .map((q, index) => ({ ...q, originalIndex: index }))
      .filter((q) => filterType === "all" || q.type === filterType);

    setFilteredQuestionsLocal(filtered);
  }, [filterType, uniqueQuestions]);

  const renderOptionRectangles = (last14DaysAnswers) => {
    if (!last14DaysAnswers || last14DaysAnswers.length === 0) {
      return <div>Loading answers...</div>;
    }

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "1rem" }}>
        {Array.from({ length: 14 }).map((_, dayIndex) => {
          const answer = last14DaysAnswers[dayIndex];
          return (
            <div
              key={dayIndex}
              style={{
                border: "1px solid black",
                borderRadius: "5px",
                padding: "5px",
                width: "90px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                Day {dayIndex + 1}
              </div>
              <div
                style={{
                  border: "1px solid gray",
                  borderRadius: ".5rem",
                  color: theme.colors.statcardtext,
                }}
              >
                {answer || "No answer"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDotClick = (index) => {
    const originalIndex = filteredQuestions[index].originalIndex;
    const selectedQuestion = uniqueQuestions[originalIndex];

    const id = selectedQuestion.id;
    const selected = selectedQuestion.question;
    const selectedType = selectedQuestion.type;

    console.log(selectedQuestion.id);

    setSelectedAnswer(selectedQuestion.answer);
    setSelectedQuestionLocal(selected);
    setIsQuestionSelected(true);

    setSelectedQuestionId(id);
    setSelectedQuestion(selected);
    console.log(selectedQuestion.response_limit);
    setQuestionLimitResponse(selectedQuestion.response_limit);

    if (selectedType === "range") {
      setIsRange(true);
      setIsOption(false);
      setIsCheckbox(false);
      setIsText(false);
    } else if (selectedType === "option") {
      setIsOption(true);
      setIsRange(false);
      setIsCheckbox(false);
      setIsText(false);

      const last14DaysAnswers = surveyData
        .filter((item) => item.question === selected)
        .map((item) => item.answer);

      setReactionData(last14DaysAnswers);
      return;
    } else if (selectedType === "checkbox") {
      setIsCheckbox(true);
      setIsOption(false);
      setIsRange(false);
      setIsText(false);

      const last14DaysAnswers = surveyData
        .filter((item) => item.question === selected)
        .map((item) => item.answer);

      setReactionData(last14DaysAnswers);
      return;
    } else {
      setIsText(true);
      setIsOption(false);
      setIsCheckbox(false);
      setIsRange(false);
    }

    const filteredData = surveyData
      .filter((item) => item.question === selected)
      .map((item, i) => parseInt(item.answer, 10) || 0);

    const days = Array.from({ length: 14 }, (_, i) => ({
      day: `Day ${i + 1}`,
      answer: filteredData[i] || 0,
    }));

    setReactionData(days.map((day) => day.answer));
    setLabels(days);
  };

  const resetGraph = () => {
    setSelectedQuestionLocal(null);
    setIsQuestionSelected(false);
    setReactionData(surveyData.map((item) => (item.is_reaction_question ? 1 : 0)));
    setLabels(surveyData.map((item) => item.answer));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
        {selectedQuestion && (
          <button
            onClick={resetGraph}
            style={{
              color: theme.colors.statcardtext,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "1.5rem",
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}
        <h2 style={{ margin: 0, textAlign: "center", flex: 1 }}>Survey Data Visualization</h2>
        <div style={{ width: "1.5rem" }}></div>
      </div>
      {isQuestionSelected && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          Questions:
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            {filteredQuestions.map((_, index) => (
              <div
                key={index}
                onClick={() => handleDotClick(index)}
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: theme.colors.statcardtext,
                  borderRadius: "50%",
                  margin: "0 5px",
                  cursor: "pointer",
                }}
              ></div>
            ))}
          </div>
          <h3>Selected Question:</h3>
          <p>{selectedQuestion}</p>
        </div>
      )}

      {!isQuestionSelected && !selectedQuestion && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3>Select a Question:</h3>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label>Filter by Type: </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => {
                setLocalFilterType(e.target.value);
                setFilterType(e.target.value);
              }}
            >
              <option value="all">All</option>
              <option value="range">Range</option>
              <option value="option">Option</option>
              <option value="checkbox">Checkbox</option>
              <option value="textField">Text Field</option>
            </select>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: "100%", gap: "1rem" }}>
            {filteredQuestions
              .map((item, index) => (
                <div
                  key={item.originalIndex}
                  onClick={() => handleDotClick(index)}
                  style={{
                    color: "black",
                    flex: "0 1 calc (50% -10px)",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    width: "18rem",
                    padding: ".5rem",
                    border: "1px solid black",
                    borderRadius: ".25rem",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {item.question}
                </div>
              )
              )}
          </div>
        </div>
      )}

      {!questionLimitResponse && (
        <>
          {selectedQuestion && (isOption || isCheckbox) && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              {renderOptionRectangles(reactionData)}
            </div>
          )}
          {selectedQuestion && !(isOption || isCheckbox) && (
            <canvas id="surveyGraph" width="400" height="200"></canvas>
          )}
        </>
      )}
      {questionLimitResponse && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3>Answer:</h3>
          <p>{selectedAnswer}</p>
        </div>
      )}

    </div>
  )
}

export default SurveyGraph;