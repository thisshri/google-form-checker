import React, { useRef, useState } from "react";
import Papa from "papaparse";

import './styles.scss';

const Home = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeader, setCsvHeader] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>();
  const [finalResult, setFinalResult] = useState<any>();
  const [questionsStartFrom, setQuestionsStartFrom] = useState<number>(0);
  
  const correctAnswerMarksField = useRef<any>();
  const incorrectAnswerMarksField = useRef<any>();

  const getTeachers = () => {
    if (!csvHeader.length) {
      return <small>Please uplaod csv file</small>
    }

    return (
      <select
        onChange={
          (event: any) => {
            const teacherResponse = event.target.value.split(',');
            setTeacher(teacherResponse);
            console.log(teacher);
          }
        }
        name="teacher"
      >
        {
          csvData.map(quizResult => {
            const [, score, name, village] = quizResult;
              return <option key={name+village} value={quizResult}>{`${ name } - (${ score })`}</option>
            }
          )
        }
      </select>
    )
  }

  const handleUplaod = (event: any) => {
    const [ file ] = event.target.files;

    Papa.parse(file, {
      complete: function(results: any) {
        // console.log("Finished:", results.data);
        const csvHeader = results.data.shift()
        setCsvHeader(csvHeader);
        setCsvData(results.data);
      }
    });
  }

  return (
    <>
      <main>
        <input
          type="file"
          onChange={handleUplaod}
        />
        <hr/>
        <span>
          Identitify Teacher
        </span>
        {
          getTeachers()
        }
        <hr/>

        <label htmlFor="foo">Marks per correct question: </label>
        <input
          type="text"
          defaultValue={1}
          ref={correctAnswerMarksField}
        />
        <br/>

        <label htmlFor="foo">Negative marks per question: </label>
        <input
          type="text"
          defaultValue={0.25}
          ref={incorrectAnswerMarksField}
        />

        <br/>
        <br/>

        <button
          onClick={(event: any) => {
            const correctAnswerMarks = correctAnswerMarksField.current.value;
            const incorrectAnswerMarks = incorrectAnswerMarksField.current.value;

            // get question index
            const questionsStartFrom = csvHeader.findIndex((heading: any, index: any) => {
              console.log(heading, index);
              return (parseInt(heading) === 1 && parseInt(csvHeader[index+1]) === 2);
            });

            setQuestionsStartFrom(questionsStartFrom);


            const finalResult = [];

            for (const questionResponse of csvData) {
              let studentCorrectResponseCount = 0;
              let studentIncorrectResponseCount = 0;
              let studentNoResponseCount = 0;
              for (let questionIndex = questionsStartFrom; questionIndex < csvHeader.length; questionIndex++) {
                const teacherQuestionResponse = teacher[questionIndex];
                const studentQuestionResponse = questionResponse[questionIndex];
                if (studentQuestionResponse === '') {
                  studentNoResponseCount++;
                }
                else if (teacherQuestionResponse === studentQuestionResponse) {
                  studentCorrectResponseCount++;
                } else {
                  studentIncorrectResponseCount++;
                }
              }
              const finalMarks = (studentCorrectResponseCount * correctAnswerMarks) - (studentIncorrectResponseCount * incorrectAnswerMarks);
              finalResult.push([questionResponse.slice(0, questionsStartFrom).concat(
                [studentNoResponseCount, studentIncorrectResponseCount, studentCorrectResponseCount, finalMarks]
              )]);
            }

            setFinalResult(finalResult.sort(
              ([ a ], [ b ]) => {
                const length = a.length;
                const _a = a[length-1] * 100;
                const _b = b[length-1] * 100;
                return _b - _a;
              }
            ));
          }}
        >
          Calculate
        </button>
      </main>
      <table
        className="result-table"
      >
      <tr>
        {
          csvHeader.slice(0, questionsStartFrom).concat(['-', '❌', '✅', 'Final Marks'])?.map((heading: any) => <th> { heading } </th>)
        }
      </tr>
      {
        finalResult?.map(
          (student: any) => <tr>
            {
              student.map((data: any) => data.map((d:any) => <td> {d}</td>))
            }
            </tr>
          )
      }
      </table>
    </>
  )
}

export default Home;