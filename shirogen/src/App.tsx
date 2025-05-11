import React, { useEffect, useRef, useState } from 'react';

// import femaleNounsData from './res/german_female_nouns.json';
// import maleNounsData from './res/german_male_nouns.json';
// import neutralNounsData from './res/german_neutral_nouns.json';
import b1nounsData from './res/b1-nouns.json'
// import verbsData from './res/german_verbs.json';
import b1VerbsData from './res/b1-verbs.json'
import b1VerbsTensesConfig from './res/b1-verb-tenses-config.json'

type VerbFormSelection = {
  baseForm: string;
  verb: string;
  tense: string;
  pronoun: string;
};

// const femaleNouns = Object.values(femaleNounsData)
// const maleNouns = Object.values(maleNounsData)
// const neutralNouns = Object.values(neutralNounsData)
const b1nouns = Object.values(b1nounsData)
const b1verbs = Object.values(b1VerbsData)

// const allNouns = [...femaleNouns, ...maleNouns, ...neutralNouns];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const shuffledNouns = shuffle(b1nouns);
const verbs = Object.values(b1verbs)
const selectedTenses = b1VerbsTensesConfig.tenses;
const tenses = Object.keys(selectedTenses);

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

  function getRandomVerb(): VerbFormSelection {
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)]; // Sometimes produces same verb as last time
    const randomTense = tenses[Math.floor(Math.random() * tenses.length)];
    const pronouns = selectedTenses[randomTense];
    const randomPronoun = pronouns[Math.floor(Math.random() * pronouns.length)];

    
    return {
      baseForm: randomVerb.word,
      verb: randomVerb.tenses[randomTense][randomPronoun],
      tense: randomTense,
      pronoun: randomPronoun
    };
  }

  const verbInputRef = useRef<HTMLInputElement>(null); // For auto focus on verbs text input
  
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
    const foundVerb = verbs.find(v => v.word === currentVerb.baseForm);
    const correctAnswerRaw = foundVerb ? foundVerb.tenses[currentVerb.tense][currentVerb.pronoun] : "Err (Not Found)";

    let correctAnswers: string[] = [];

    if (correctAnswerRaw.includes(" ")) {
      const [forms, prefix] = correctAnswerRaw.split(" ");
      correctAnswers = forms.split("/").map(form => `${form} ${prefix}`);
    } else if (correctAnswerRaw.includes("/")) {
      correctAnswers = correctAnswerRaw.split("/");
    }else {
      correctAnswers = [correctAnswerRaw];
    }

    const correct = correctAnswers.includes(userAnswer);
    
    if (!verbAnswered) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1)
      } else {
        setIncorrectAnswers(prev => prev + 1)
      }
      setVerbAnswered(true)
    }
    setVerbFeedback(correct ? "Correct!" : 'Wrong! The correct answer' + (correctAnswers.length === 1 ? ' is' : 's are') + ': ' + correctAnswers.join("/") + '!');
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
          <h2>What's the article for: <strong>
            <a 
              href={`https://translate.google.com/?sl=de&tl=ja&text=${encodeURIComponent(currentNoun.word)}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              >
                {currentNoun.word}
            </a></strong>?</h2>
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
          <h2>Enter the <strong>{currentVerb.tense}</strong> form of <strong>
          <a 
              href={`https://translate.google.com/?sl=de&tl=ja&text=${encodeURIComponent(currentVerb.baseForm)}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              >
                {currentVerb.baseForm}
              </a>
              </strong>:</h2>
          <div className="verb-input-row">
            <span className="pronoun-tag">{currentVerb.pronoun}</span>
            <input
              type="text"
              ref={verbInputRef}
              onKeyDown={handleKeyDown}
              value={verbInput}
              onChange={(e) => setVerbInput(e.target.value)}
              placeholder="Type your answer..."
              className="text-input short"
            />
            <button className="submit-button" onClick={handleVerbSubmit}>Submit</button>
          </div>
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