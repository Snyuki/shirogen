import React, { useEffect, useRef, useState } from 'react';

// import femaleNounsData from './res/german_female_nouns.json';
// import maleNounsData from './res/german_male_nouns.json';
// import neutralNounsData from './res/german_neutral_nouns.json';
import b1nounsData from './res/b1-nouns.json'
import verbsData from './res/german_verbs.json';

// const femaleNouns = Object.values(femaleNounsData)
// const maleNouns = Object.values(maleNounsData)
// const neutralNouns = Object.values(neutralNounsData)
const b1nouns = Object.values(b1nounsData)

// const allNouns = [...femaleNouns, ...maleNouns, ...neutralNouns];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledNouns = shuffle(b1nouns);

const verbs = Object.values(verbsData)

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

  const verbInputRef = useRef<HTMLInputElement>(null); // For auto focus on verbs text input
  const verbTenseKey = Object.keys(currentVerb.tenses)[0]; // As long as there is only one tense this is enough
  
  const handleAnswer = (answer: string) => {
    const correct = currentNoun.article.indexOf(answer) >= 0;
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
    const foundVerb = verbs.find(v => v.word === currentVerb.word);
    const correctAnswer = foundVerb ? foundVerb.tenses.past : "Err (Not Found)";
    const correct = userAnswer === correctAnswer;

    if (!verbAnswered) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1)
      } else {
        setIncorrectAnswers(prev => prev + 1)
      }
      setVerbAnswered(true)
    }
    setVerbFeedback(correct ? "Correct!" : 'Wrong! The correct answer is "' + currentVerb.tenses.past + '"!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && mode === 'gender' && nounAnswered) {
      nextQuestion()
    } else if (e.key === 'Enter' && e.ctrlKey && mode === 'verb' && verbAnswered) {
      nextVerbQuestion()
    } else if (e.key === 'Enter' && !e.ctrlKey && mode === 'verb') {
      handleVerbSubmit();
    }
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
  const incorrectPercentage = totalAnswers === 0 ? 0 : 100 - correctPercentage;

  return (
    <div className="quiz-container">
      <div className="mode-switch-container">
        <button
          className={`mode-button ${mode === 'gender' ? 'active' : ''}`}
          onClick={() => setMode('gender')}
        >
          Genders
        </button>
        <button
          className={`mode-button ${mode === 'verb' ? 'active' : ''}`}
          onClick={() => setMode('verb')}
        >
          Verbs
        </button>
      </div>
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
          <button className="next-button" disabled={!nounAnswered} title={!nounAnswered ? "Please answer first" : ""} onClick={nextQuestion}>Next</button>
        </>
      ) : (
        <>
          <h2>Enter the <strong>{verbTenseKey}</strong> form of <strong>{currentVerb.word}</strong>:</h2>
          <input
            type="text"
            ref={verbInputRef}
            onKeyDown={handleKeyDown}
            value={verbInput}
            onChange={(e) => setVerbInput(e.target.value)}
            placeholder="Type your answer..."
            className="text-input"
          />
          <button className="submit-button" onClick={handleVerbSubmit}>Submit</button>
          <div className={`feedback ${verbFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
            {verbFeedback}
          </div>
          <button className="next-button" disabled={!verbAnswered} title={!verbAnswered ? "Please answer first" : ""} onClick={nextVerbQuestion}>Next</button>
        </>
      )}
    </div>
    
  );
};

export default GenderQuiz;