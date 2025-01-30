"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle } from "lucide-react"
import confetti from "canvas-confetti"
import React from "react"

interface Question {
  Question_ID: string
  Question_Text: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
  answer_key: number
  Solution: string
}

interface QuizState {
  currentQuestion: number
  score: number
  answers: (number | null)[]
}

const formatQuestionText = (text: string) => {
  return text.split("\\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split("\\n").length - 1 && <br />}
    </React.Fragment>
  ))
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quizState")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return { currentQuestion: 0, score: 0, answers: [] }
  })
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data)
        if (quizState.answers.length === 0) {
          setQuizState((prev) => ({ ...prev, answers: new Array(data.length).fill(null) }))
        }
      })
  }, [quizState.answers.length])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("quizState", JSON.stringify(quizState))
    }
  }, [quizState])

  const handleAnswer = () => {
    if (selectedAnswer !== null) {
      const correct = Number.parseInt(selectedAnswer) === questions[quizState.currentQuestion].answer_key
      setIsCorrect(correct)
      if (correct) {
        setQuizState((prev) => ({ ...prev, score: prev.score + 1 }))
        triggerConfetti()
      }
      setQuizState((prev) => ({
        ...prev,
        answers: prev.answers.map((ans, idx) =>
          idx === quizState.currentQuestion ? Number.parseInt(selectedAnswer) : ans,
        ),
      }))
      setShowSolution(true)
    }
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const nextQuestion = () => {
    if (quizState.currentQuestion + 1 < questions.length) {
      setQuizState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
      setSelectedAnswer(null)
      setShowSolution(false)
      setIsCorrect(null)
    } else {
      setShowResult(true)
    }
  }

  const restartQuiz = () => {
    const newState = { currentQuestion: 0, score: 0, answers: new Array(questions.length).fill(null) }
    setQuizState(newState)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowSolution(false)
    setIsCorrect(null)
    localStorage.setItem("quizState", JSON.stringify(newState))
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (showResult) {
    return (
      <Card className="w-[400px] max-w-full bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-4">
            Your score: {quizState.score} out of {questions.length}
          </p>
          <Progress value={(quizState.score / questions.length) * 100} className="w-full h-3 mb-4" />
          <p className="text-lg">
            {quizState.score === questions.length
              ? "Perfect score! Excellent job!"
              : quizState.score >= questions.length * 0.7
                ? "Great job! You did well!"
                : quizState.score >= questions.length * 0.5
                  ? "Good effort! Keep practicing!"
                  : "You can do better! Try again!"}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={restartQuiz} className="px-8 py-2">
            Restart Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[quizState.currentQuestion]

  return (
    <Card className="w-[500px] max-w-full bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Question {quizState.currentQuestion + 1} of {questions.length}
        </CardTitle>
        <Progress value={(quizState.currentQuestion / questions.length) * 100} className="w-full h-2" />
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-lg font-medium">{formatQuestionText(question.Question_Text)}</p>
        <RadioGroup
          value={selectedAnswer || quizState.answers[quizState.currentQuestion]?.toString() || ""}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {[1, 2, 3, 4].map((choice) => (
            <div
              key={choice}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                showSolution && choice === question.answer_key
                  ? "bg-green-100 dark:bg-green-900/30"
                  : showSolution && selectedAnswer === choice.toString() && choice !== question.answer_key
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "hover:bg-muted"
              }`}
            >
              <RadioGroupItem value={choice.toString()} id={`choice${choice}`} disabled={showSolution} />
              <Label htmlFor={`choice${choice}`} className="flex-grow cursor-pointer">
                {question[`choice_${choice}` as keyof Question]}
              </Label>
              {showSolution && choice === question.answer_key && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {showSolution && selectedAnswer === choice.toString() && choice !== question.answer_key && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          ))}
        </RadioGroup>
        {showSolution && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            <p className="font-bold mb-2">{isCorrect ? "Correct!" : "Incorrect!"}</p>
            <p>{question.Solution}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        {!showSolution ? (
          <Button
            onClick={handleAnswer}
            disabled={!selectedAnswer && quizState.answers[quizState.currentQuestion] === null}
            className="w-full"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={nextQuestion} className="w-full">
            {quizState.currentQuestion + 1 < questions.length ? "Next Question" : "See Results"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

