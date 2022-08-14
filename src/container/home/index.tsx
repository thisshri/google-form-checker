import React, { useRef, useState } from "react";
import Papa from "papaparse";

import {
  Button,
  Container,
  Table,
} from 'react-bootstrap';

import './styles.scss';

const Home = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeader, setCsvHeader] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>();
  const [finalResult, setFinalResult] = useState<any>();
  const [questionsStartFrom, setQuestionsStartFrom] = useState<number>(0);
  
  const correctAnswerMarksField = useRef<any>();
  const incorrectAnswerMarksField = useRef<any>();

  const calculate = () => {
    const correctAnswerMarks = correctAnswerMarksField.current.value;
    const incorrectAnswerMarks = incorrectAnswerMarksField.current.value;

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
  }

  const getQuestions = () => {
    if (!csvHeader.length) {
      return <small>Please uplaod csv file</small>
    }

    return (
      <select
        onChange={
          (event: any) => {
            setQuestionsStartFrom(event.target.value);
            console.log(teacher);
          }
        }
        name="questions"
      >
        {
          csvHeader.map(( title, index) => <option key={index} value={index}>{title}</option>)
        }
      </select>
    )
  }

  const getTeachers = () => {
    return (
      <select
        className="formControl"
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
        const csvHeader = results.data.shift()
        setCsvHeader(csvHeader);
        setCsvData(results.data);
      }
    });
  }

  if (!csvHeader.length) {
    return <>
      <label htmlFor="csvUpload">Upload the CSV File </label>
      <input className="custom-file-input" name="csvUpload" type="file" onChange={handleUplaod} />
    </>
  }

  return (
    <Container className="d-grid gap-2">
      <section>
        <p>
          <label htmlFor="inputTeacher">
            Identitify Teacher
          </label>
        </p>
        { getTeachers() }
      </section>

      <section>
        <p>
          Select First Questions
        </p>
        { getQuestions() }
      </section>

      <section>
        <label htmlFor="correctMarks">Marks Per Correct Question: </label>
        <input
          name="correctMarks"
          type="text"
          defaultValue={1}
          ref={correctAnswerMarksField}
        />
      </section>

      <section>
        <label htmlFor="foo">Marks Per Negative Question: </label>
        <input
          type="text"
          defaultValue={0.25}
          ref={incorrectAnswerMarksField}
        />
      </section>

    <section className="d-grid gap-2">
      <Button variant="primary"
        onClick={calculate}
      >
        Calculate
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          setCsvHeader([])
          setCsvData([])
        }}
      >
        Clear
      </Button>
    </section>

      <Table
        striped="columns"
        bordered
        responsive
        size="sm"
      >
        <tr>
          {
            csvHeader.slice(0, questionsStartFrom).concat(['-', '❌', '✅', 'Final Marks'])?.map((heading: any) => <th> { heading } </th>)
          }
        </tr>
        {
          finalResult?.map(
            (student: any) => <tr>{ student.map((data: any) => data.map((d:any) => <td> {d}</td>))}</tr>
          )
        }
      </Table>
    </Container>
  )
}

export default Home;