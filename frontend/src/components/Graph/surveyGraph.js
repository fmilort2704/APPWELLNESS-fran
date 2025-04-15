import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { isCookie } from "react-router-dom";

function SurveyGraph({ patientId }) {
  const [surveyData, setSurveyData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [reactionData, setReactionData] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(0);
  const [isRange, setIsRange] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isQuestionSelected, setIsQuestionSelected] = useState(false);
  const chartRef = useRef(null);
  const [optionQuestions, setOptionQuestion] = useState([])
  const [checkboxQuestions, setCheckboxQuestion] = useState([])
  const [isOption, setIsOption] = useState(false);
  const [isCheckbox, setIsCheckbox] = useState(false)

  useEffect(() => {
    const fetchOptionQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/question_options/${patientId}`);
        const data = response.data;

        setOptionQuestion(data); // Actualizar el estado con las preguntas de opciones
        console.log(data)
      } catch (err) {
        console.error("Error fetching survey data:", err);
      }
    };
    fetchOptionQuestion();
  }, [patientId]);

  useEffect(() => {
    const fetchCheckboxQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/question_checkboxes/${patientId}`);
        const data = response.data;

        setCheckboxQuestion(data); 
        console.log(data)
      } catch (err) {
        console.error("Error fetching survey data:", err);
      }
    };
    fetchCheckboxQuestion();
  }, [patientId]);

  useEffect(() => {

    const fetchSurveyData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/patients/${patientId}/answers_14_days`);
        const data = response.data;

        const filteredData = data.filter(
          (item) => item.question !== "No data" && item.answer !== "N/A"
        );

        const days = Array.from({ length: filteredData.length }, (_, index) => ({
          day: `Day ${index + 1}`,
          answer: filteredData[index] || 0,
        }));

        const processedQuestions = filteredData.map((item, index) => {
          console.log(optionQuestions.find(option => option.answer === item.answer))
          const isOption = optionQuestions.find(option => option.answer === item.answer);
          const isCheckbox = checkboxQuestions.find(check => check.question === item.question);
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
          } else if (isCheckbox){
          const type = "checkbox";
          return {
            ...item,
            day: days[index]?.day,
            type,
          };
        } else {
          const type = "normal";
          return {
            ...item,
            day: days[index]?.day,
            type,
          };
        }
        }).filter(Boolean); // Filtrar valores nulos

        setLabels(processedQuestions.map((item) => item.answer));
        setSurveyData(processedQuestions);
      } catch (err) {
        console.error("Error fetching survey data:", err);
      }
    };

    fetchSurveyData();
  }, [patientId, optionQuestions]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const chartType = selectedQuestion && isRange ? "line" : "bar";
    const chartCanvas = document.getElementById("surveyGraph");
    const data = {
      labels: isQuestionSelected
        ? Array.from({ length: reactionData.length }, (_, i) => `Day ${i + 1}`)
        : surveyData.map((item) => item.answer),
      datasets: [
        {
          label: isQuestionSelected ? `Responses for: ${selectedQuestion}` : "Reaction Questions",
          data: reactionData,
          borderColor: "blue",
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
      ],
    };

    const config = {
      type: chartType,
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
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
              text: isQuestionSelected ? "Days" : "Survey Answers", // Cambiar título dinámicamente
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
                  padding: ".5rem",
                  border: "1px solid gray",
                  borderRadius: ".5rem",
                  color: "black",
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
    const id = surveyData[index]?.id;
    const selected = surveyData[index]?.question;
    const selectedType = surveyData[index]?.type

    setSelectedQuestion(selected);
    setSelectedQuestionId(id);
    console.log(surveyData[index]?.type);
    if (selectedType === "range") {
      setIsRange(true);
      setIsOption(false);
      setIsCheckbox(false);
    } else if (selectedType === "option") {
      setIsOption(true)
      setIsRange(false);
      setIsCheckbox(false)
    

      const last14DaysAnswers = surveyData
        .filter((item) => item.question === selected)
        .map((item) => item.answer);

      setReactionData(last14DaysAnswers);
      setIsQuestionSelected(true);
      return;
    }  else if (selectedType === "checkbox"){
      setIsCheckbox(true);
      setIsOption(false);
      setIsRange(false);

      const last14DaysAnswers = surveyData
        .filter((item) => item.question === selected)
        .map((item) => item.answer);

      setReactionData(last14DaysAnswers);
      setIsQuestionSelected(true);
      return;
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
    setIsQuestionSelected(true);
  };

  const resetGraph = () => {
    setSelectedQuestion(null);
    setSelectedAnswer(null);
    setIsQuestionSelected(false);
    setReactionData(surveyData.map((item) => (item.is_reaction_question ? 1 : 0)));
    setLabels(surveyData.map((item) => item.answer));
  };

  const uniqueQuestions = surveyData.filter(
  (item, index, self) =>
    self.findIndex((q) => q.question === item.question) === index // Filtrar preguntas únicas
);

return (
  <div>
    <h2>Survey Data Visualization</h2>
    {isQuestionSelected && (
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={resetGraph} style={{ marginBottom: "20px" }}>
          Reset Graph
        </button>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
          {uniqueQuestions.map((_, index) => (
            <div
              key={index}
              onClick={() => handleDotClick(index)} // Manejar clic en el punto
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "blue",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: Math.ceil(uniqueQuestions.length / 2) }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {uniqueQuestions
                .slice(rowIndex * 2, rowIndex * 2 + 2) // Obtener dos preguntas por fila
                .map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleDotClick(rowIndex * 2 + index)} // Seleccionar la pregunta al hacer clic
                    style={{
                      width: "30rem",
                      cursor: "pointer",
                      padding: ".5rem",
                      border: "1px solid black",
                      borderRadius: ".25rem",
                      backgroundColor: "#f9f9f9",
                      textAlign: "center",
                    }}
                  >
                    {item.question}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    )}
    {selectedQuestion && (isOption || isCheckbox) && (
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {renderOptionRectangles(reactionData)}
      </div>
    )}
    {selectedQuestion && !(isOption || isCheckbox) && (
      <canvas id="surveyGraph" width="400" height="200"></canvas>
    )}
    {selectedAnswer && (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>Answer:</h3>
        <p>{selectedAnswer}</p>
      </div>
    )}
  </div>
)}

export default SurveyGraph;