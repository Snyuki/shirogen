import React, { useState, useEffect } from 'react';

import jlpt5Data from '../../res/japanese/jlpt_n5_words.json'


const jlpt5Words = Object.values(jlpt5Data);

const MainJapaneseQuiz = () => {
  const [currentWord, setCurrentWord] = getRandomWord();
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState('');

  const getRandomWord = () => {
    const randomWordIndex = Math.floor(Math.random() * jlpt5Words.length);
    return jlpt5Words[randomWordIndex];
  }

  const getRandomChoices = () => {
    const choices = new Set();
    choices.add(correctWord.senses[0].english_definitions[0]);
  
    while (choices.size < 3) {
      const random = allWords[Math.floor(Math.random() * allWords.length)];
      const def = random.senses[0].english_definitions[0];
      if (def !== correctWord.senses[0].english_definitions[0]) {
        choices.add(def);
      }
    }
  
    return Array.from(choices).sort(() => Math.random() - 0.5);
  };


  if (!currentWord) return <div>Loading...</div>;

  return (
    <div id="root">
      <h2>What does "{kanji}" mean?</h2>
      {choices.map((choice, idx) => (
        <button key={idx} onClick={() => handleChoice(choice)}>
          {choice}
        </button>
      ))}
      {feedback && (
        <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
          {feedback}
        </div>
      )}
      {feedback && <button onClick={nextQuestion}>Next</button>}
    </div>
  );
}

export default MainJapaneseQuiz;