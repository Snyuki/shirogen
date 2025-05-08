import React, { useState } from 'react';

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

const GenderQuiz = () => {
  const [currentNoun, setCurrentNoun] = useState(() => getRandomNoun());
  const [feedback, setFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);

  function getRandomNoun() {
    const randomIndex = Math.floor(Math.random() * shuffledNouns.length);
    return shuffledNouns[randomIndex];
  }
  
  const handleAnswer = (answer: string) => {
    const correct = currentNoun.article === answer;
    if (correct) {
      setCorrectAnswers(prev => prev + 1)
    } else {
      setIncorrectAnswers(prev => prev + 1)
    }
    setFeedback(correct ? 'Correct!' : `Wrong!`);
  };

  const nextQuestion = () => {
    setFeedback('');
    setCurrentNoun(getRandomNoun());
  };

  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const incorrectPercentage = 100 - correctPercentage;

  return (
    <div className="quiz-container">
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
        <div className="progress-bar-text">
          <span>{Math.round(correctPercentage)}%</span>
          <span>{Math.round(incorrectPercentage)}%</span>
        </div>
      </div>

      <h2>What's the article for: <strong>{currentNoun.word}</strong>?</h2>
      <button onClick={() => handleAnswer('der')}>der</button>
      <button onClick={() => handleAnswer('die')}>die</button>
      <button onClick={() => handleAnswer('das')}>das</button>
      <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
        {feedback}
      </div>
      <button className="next-button" onClick={nextQuestion}>Next</button>
    </div>
  );
};

export default GenderQuiz;