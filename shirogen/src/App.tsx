import React, { useEffect, useRef, useState } from 'react';

import femaleNounsData from './res/german_female_nouns.json';
import maleNounsData from './res/german_male_nouns.json';
import neutralNounsData from './res/german_neutral_nouns.json';

const femaleNouns = Object.values(femaleNounsData)
const maleNouns = Object.values(maleNounsData)
const neutralNouns = Object.values(neutralNounsData)

const allNouns = [...femaleNouns, ...maleNouns, ...neutralNouns];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledNouns = shuffle(allNouns);

const verbs = [
  { root: "gehen", tense: "past", answer: "ging" },
  { root: "sein", tense: "past", answer: "war" },
  { root: "haben", tense: "past", answer: "hatte" },
];

const GenderQuiz = () => {
  const [mode, setMode] = useState<'gender' | 'verb'>('gender')
  const [currentNoun, setCurrentNoun] = useState(() => getRandomNoun());
  const [feedback, setFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [nounAnswered, setNounAnswered] = useState(false);
  const [verbAnswered, setVerbAnswered] = useState(false);

  // Verbs
  const [currentVerb, setCurrentVerb] = useState(() => getRandomVerb());
  const [verbInput, setVerbInput] = useState('');
  const [verbFeedback, setVerbFeedback] = useState('');

  function getRandomNoun() {
    const randomIndex = Math.floor(Math.random() * shuffledNouns.length);
    return shuffledNouns[randomIndex];
  }

  function getRandomVerb() {
    const randomIndex = Math.floor(Math.random() * verbs.length);
    return verbs[randomIndex];
  }

  function swapMode() {
    setMode(mode === 'gender' ? 'verb' : 'gender')
  }

  const verbInputRef = useRef<HTMLInputElement>(null); // For auto focus on verbs text input
  
  const handleAnswer = (answer: string) => {
    const correct = currentNoun.article === answer;
    if (!nounAnswered) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1)
      } else {
        setIncorrectAnswers(prev => prev + 1)
      }
      setNounAnswered(true)
    }
    setFeedback(correct ? 'Correct!' : `Wrong!`);
  };

  const nextQuestion = () => {
    setNounAnswered(false)
    setFeedback('');
    setCurrentNoun(getRandomNoun());
  };

  const handleVerbSubmit = () => {
    const userAnswer = verbInput.trim().toLowerCase();
    const foundVerb = verbs.find(v => v.root === currentVerb.root);
    const correctAnswer = foundVerb ? foundVerb.answer : "Err (Not Found)";
    const correct = userAnswer === correctAnswer;

    if (!verbAnswered) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1)
      } else {
        setIncorrectAnswers(prev => prev + 1)
      }
      setVerbAnswered(true)
    }
    setVerbFeedback(correct ? "Correct!" : 'Wrong! The correct answer is "' + currentVerb.answer + '"!');
  };

  const nextVerbQuestion = () => {
      setVerbAnswered(false)
      setVerbInput('')
      setVerbFeedback('')
      setCurrentVerb(getRandomVerb());
  };

  useEffect(() => {
    if (mode === 'verb' && verbInputRef.current) {
      verbInputRef.current.focus();
    }
  }, [mode, currentVerb]);


  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const incorrectPercentage = 100 - correctPercentage;

  return (
    <div className="quiz-container">
      <button className="switch-button" onClick={swapMode}>
        Switch to {mode === 'gender' ? 'Verb Form Quiz' : 'Gender Quiz'}
      </button>
      <div className="progress-bar-text">
        <span className="progress-text correct">{Math.round(correctPercentage)}% ({correctAnswers})</span>
        <span>{Math.round(totalAnswers)}</span>
        <span className="progress-text incorrect">({incorrectAnswers}) {Math.round(incorrectPercentage)}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-bar correct"
            style={{
              width: `${correctPercentage}%`,
            }}
          />
          <div
            className="progress-bar incorrect"
            style={{
              width: `${incorrectPercentage}%`,
            }}
          />
        </div>
      </div>
      {mode === 'gender' ? (
        <>
          <h2>What's the article for: <strong>{currentNoun.word}</strong>?</h2>
          <button onClick={() => handleAnswer('der')}>der</button>
          <button onClick={() => handleAnswer('die')}>die</button>
          <button onClick={() => handleAnswer('das')}>das</button>
          <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
            {feedback}
          </div>
          <button className="next-button" onClick={nextQuestion}>Next</button>
        </>
      ) : (
        <>
          <h2>Enter the <strong>{currentVerb.tense}</strong> form of <strong>{currentVerb.root}</strong>:</h2>
          <input
            type="text"
            ref={verbInputRef}
            value={verbInput}
            onChange={(e) => setVerbInput(e.target.value)}
            placeholder="Type your answer..."
            className="text-input"
          />
          <button className="submit-button" onClick={handleVerbSubmit}>Submit</button>
          <div className={`feedback ${verbFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
            {verbFeedback}
          </div>
          <button className="next-button" onClick={nextVerbQuestion}>Next</button>
        </>
      )}
    </div>
    
  );
};

export default GenderQuiz;