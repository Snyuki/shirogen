import React, { useEffect, useRef, useState } from 'react';

import styles from './MainGermanQuiz.module.css'

// components
import AdjectiveInfoPopup from '../AdjectiveInfoPopup'
import Popup from '../Popup';

import b1nounsData from '../../res/german/b1-nouns.json'
import b1VerbsData from '../../res/german/b1-verbs.json'
import verbsTensesConfig from '../../res/german/verb-tenses-config.json'
import b1AdjectiveData from '../../res/german/b1-adjectives.json'
import adjectiveConfig from '../../res/german/adjective-config.json'

import customNounsData from '../../res/german/custom-nouns.json'

type VerbFormSelection = {
  baseForm: string;
  verb: string;
  tense: string;
  pronoun: string;
};

type AdjectiveFormSelection = {
  baseForm: string;   // Base Form
  adjective: string;  // Correct Answer
  case: string;   // Kasus
  form: string;   // base/comparative/superlative
  specification: string; // unbestimmt/bestimmt/no_article
  gender: string; // Maskulin/Feminin/Neutral/Plural
};

const wordLists = {
  B1: {
    nouns: shuffle(Object.values(b1nounsData)),
    verbs: Object.values(b1VerbsData),
    adjectives: Object.values(b1AdjectiveData),
  },
  Custom: {
    nouns: shuffle(Object.values(customNounsData)),
    verbs: Object.values(b1VerbsData),
    adjectives: Object.values(b1AdjectiveData),
  },
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const selectedTenses = verbsTensesConfig.tenses;
const tenses = Object.keys(selectedTenses);

const GenderQuiz = () => {
  const [selectedList, setSelectedList] = useState<string>('B1');
  const [mode, setMode] = useState<'gender' | 'verb' | 'adjective'>('gender')
  const [currentNoun, setCurrentNoun] = useState(() => getRandomNoun());
  const [feedback, setFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [nounAnswered, setNounAnswered] = useState(false);
  const [verbAnswered, setVerbAnswered] = useState(false);
  const [adjectiveAnswered, setAdjectiveAnswered] = useState(false);

  // Verbs
  const [currentVerb, setCurrentVerb] = useState(() => getRandomVerb());
  const [verbInput, setVerbInput] = useState('');
  const [verbFeedback, setVerbFeedback] = useState('');

  // Adjectives
  const [currentAdjective, setCurrentAdjective] = useState(() => getRandomAdjective());
  const [adjectiveInput, setAdjectiveInput] = useState('');
  const [adjectiveFeedback, setAdjectiveFeedback] = useState('');
  const adjectiveFormLabels: { [key: string]: string } = {
    base_form: "Grundform",
    comparative: "Komparativ",
    superlative: "Superlativ",
  };
  const adjectiveSpecLabels: { [key: string]: string } = {
    no_article: "Kein Artikel",
    bestimmt: "Bestimmt",
    unbestimmt: "Unbestimmt"
  };
  const [adjectiveButtonLabel, setAdjectiveButtonLabel] = useState('Adjectives');

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const updateAdjectiveButtonLabel = () => {
    if (window.innerWidth < 500) {
      setAdjectiveButtonLabel('Adj.');
    } else {
      setAdjectiveButtonLabel('Adjectives');
    }
  };

  const updateAdjectivePopupText = () => {
    const text = `
    Please enter the correct adjective declension for [${currentAdjective.baseForm}] with the following attributes:

    - Gender: ${currentAdjective.gender}
    - Case: ${currentAdjective.case}
    - Form: ${adjectiveFormLabels[currentAdjective.form]}
    - Specification: ${adjectiveSpecLabels[currentAdjective.specification]}
    
    In case of indefinite plural: always use a form of "kein" as prefix.
    
    Example:
    For the adjective "gut" with a masculine plural noun in the nominative case and an indefinite-type determiner, you would enter: "keine guten".

    Note: German has no true indefinite article in the plural. Instead, words like "kein" function as determiners in these cases.
  `;
    return text
  }

  function getRandomNoun() {
    const currentNouns = wordLists[selectedList]?.nouns || [];
    const randomIndex = Math.floor(Math.random() * currentNouns.length);
    return currentNouns[randomIndex];
  }

  function getRandomVerb(): VerbFormSelection {
    const currentVerbs = wordLists[selectedList]?.verbs || [];
    const randomVerb = currentVerbs[Math.floor(Math.random() * currentVerbs.length)]; // Sometimes produces same verb as last time
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

  function getRandomAdjective(attempts = 0): AdjectiveFormSelection {
  const currentAdjectives = wordLists[selectedList]?.adjectives || [];

    // Infinite recursion protection
    if (attempts > 10) {
      alert("No Adjective found after " + attempts + " tries!")
      return {
        baseForm: '',
        adjective: '',
        case: '',
        form: '',
        specification: '',
        gender: '',
      };
    }

    const randomAdjective = currentAdjectives[Math.floor(Math.random() * currentAdjectives.length)];
    const allowedForms = Object.keys(adjectiveConfig.Formen).filter(f => adjectiveConfig.Formen[f] === 1);
    const allowedCases = Object.keys(adjectiveConfig.Kasi).filter(k => adjectiveConfig.Kasi[k] === 1);
    const allowedGenders = Object.keys(adjectiveConfig.Gender).filter(g => adjectiveConfig.Gender[g] === 1);
    const allowedSpecs = Object.keys(adjectiveConfig.Specifications).filter(s => adjectiveConfig.Specifications[s] === 1);

    // Try all combinations in a randomized order for fairness
    const shuffledForms = shuffle([...allowedForms]);
    const shuffledCases = shuffle([...allowedCases]);
    const shuffledGenders = shuffle([...allowedGenders]);
    const shuffledSpecs = shuffle([...allowedSpecs]);

    for (const randomForm of shuffledForms) {
      for (const randomCase of shuffledCases) {
        for (const randomGender of shuffledGenders) {
          for (const randomSpec of shuffledSpecs) {
            const adjective = randomAdjective.declensions?.[randomForm]?.[randomCase]?.[randomGender]?.[randomSpec];
            if (adjective && adjective.trim() !== '') {
              return {
                baseForm: randomAdjective.word,
                adjective,
                case: randomCase,
                form: randomForm,
                specification: randomSpec,
                gender: randomGender,
              };
            }
          }
        }
      }
    }

    // If no valid adjective form is found for this word, try a different adjective
    return getRandomAdjective(attempts + 1);
  }
  
  const verbInputRef = useRef<HTMLInputElement>(null); // For auto focus on verbs text input
  const adjectiveInputRef = useRef<HTMLInputElement>(null); // For auto focus on verbs text input
  
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
    const currentVerbs = wordLists[selectedList]?.verbs || [];
    const userAnswer = verbInput.trim().toLowerCase();
    const foundVerb = currentVerbs.find(v => v.word === currentVerb.baseForm);
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

  const handleAdjectiveSubmit = () => {
    const userAnswer = adjectiveInput.trim().toLowerCase();
  
    let correctAnswers: string[] = [];
  
    if (currentAdjective.adjective.includes(" ")) {
      const [prefix, formsPart] = currentAdjective.adjective.split(" ");
      const forms = formsPart.split("/");
      correctAnswers = forms.map(form => `${prefix} ${form}`.toLowerCase());
    } else if (currentAdjective.adjective.includes("/")) {
      correctAnswers = currentAdjective.adjective.split("/").map(a => a.toLowerCase());
    } else {
      correctAnswers = [currentAdjective.adjective.toLowerCase()];
    }
  
    const correct = correctAnswers.includes(userAnswer);
  
    if (!adjectiveAnswered) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1);
      } else {
        setIncorrectAnswers(prev => prev + 1);
      }
      setAdjectiveAnswered(true);
    }
  
    setAdjectiveFeedback(
      correct
        ? "Correct!"
        : `Wrong! The correct answer${correctAnswers.length === 1 ? ' is' : 's are'}: ${correctAnswers.join(" / ")}!`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && mode === 'gender' && nounAnswered) {
      nextQuestion()
    } else if (e.key === 'Enter' && e.ctrlKey && mode === 'verb' && verbAnswered) {
      nextVerbQuestion()
    } else if (e.key === 'Enter' && e.ctrlKey && mode === 'adjective' && adjectiveAnswered) {
      nextAdjectiveQuestion()
    } else if (e.key === 'Enter' && !e.ctrlKey && mode === 'verb') {
      handleVerbSubmit();
    } else if (e.key === 'Enter' && !e.ctrlKey && mode === 'adjective') {
      handleAdjectiveSubmit();
    }
  };

  const nextVerbQuestion = () => {
      setVerbAnswered(false)
      setVerbInput('')
      setVerbFeedback('')
      setCurrentVerb(getRandomVerb());
  };

  const nextAdjectiveQuestion = () => {
    setAdjectiveAnswered(false)
    setAdjectiveInput('')
    setAdjectiveFeedback('')
    setCurrentAdjective(getRandomAdjective())
  }

  useEffect(() => {
    if (mode === 'verb' && verbInputRef.current) {
      verbInputRef.current.focus();
    }
  }, [mode, currentVerb]);

  useEffect(() => {
    if (mode === 'adjective' && adjectiveInputRef.current) {
      adjectiveInputRef.current.focus();
    }
  }, [mode, currentAdjective]);

  useEffect(() => {
    window.addEventListener('resize', updateAdjectiveButtonLabel);
    updateAdjectiveButtonLabel();
    return () => {
      window.removeEventListener('resize', updateAdjectiveButtonLabel);
    };
  }, []);

  useEffect(() => {
    setCurrentNoun(getRandomNoun());
    setCurrentVerb(getRandomVerb());
    setCurrentAdjective(getRandomAdjective());
  }, [selectedList]);

  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const incorrectPercentage = totalAnswers === 0 ? 0 : 100 - correctPercentage;

  return (
    <div className="quiz-container">
      <div className="wordListSelector">
        <select className="listSelect" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
          {Object.keys(wordLists).map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
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
        <button
          className={`mode-button ${mode === 'adjective' ? 'active' : ''}`}
          onClick={() => setMode('adjective')}
        >
          {adjectiveButtonLabel}
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
          <h2>What's the article for: <strong className="emphasizeText">
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
      ) : mode === 'verb' ? (
        <>
          <h2>Enter the <strong className="emphasizeText">{currentVerb.tense}</strong> form of <strong className="emphasizeText">
          <a 
              href={`https://translate.google.com/?sl=de&tl=ja&text=${encodeURIComponent(currentVerb.baseForm)}&op=translate`}
              target="_blank"
              rel="noopener noreferrer"
              >
                {currentVerb.baseForm}
              </a>
              </strong>:</h2>
          <div className={styles.verbInputRow}>
            <span className={styles.pronounTag}>{currentVerb.pronoun}</span>
            <input
              type="text"
              ref={verbInputRef}
              onKeyDown={handleKeyDown}
              value={verbInput}
              onChange={(e) => setVerbInput(e.target.value)}
              placeholder="Type your answer..."
              className={styles.textInput}
            />
            <button className={styles.submitButton} onClick={handleVerbSubmit}>Submit</button>
          </div>
          <div className={`feedback ${verbFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
            {verbFeedback}
          </div>
          <button className="next-button" disabled={!verbAnswered} title={!verbAnswered ? "Please answer first" : ""} onClick={nextVerbQuestion}>Next</button>
        </>
      ) : (
        <>
        <h2>Enter the <strong className="emphasizeText">{adjectiveFormLabels[currentAdjective.form]}</strong> | <strong className="emphasizeText">{currentAdjective.gender}</strong> | <strong className="emphasizeText">{currentAdjective.case}</strong> | <strong className="emphasizeText">{adjectiveSpecLabels[currentAdjective.specification]}</strong> of <strong className="emphasizeText">
        <a 
            href={`https://translate.google.com/?sl=de&tl=ja&text=${encodeURIComponent(currentAdjective.baseForm)}&op=translate`}
            target="_blank"
            rel="noopener noreferrer"
            >
              {currentAdjective.baseForm}
            </a>
            </strong>: 
            <AdjectiveInfoPopup 
            updatePopupText={updateAdjectivePopupText}/></h2>
        <div className="verb-input-row">
          <input
            type="text"
            ref={adjectiveInputRef}
            onKeyDown={handleKeyDown}
            value={adjectiveInput}
            onChange={(e) => setAdjectiveInput(e.target.value)}
            placeholder="Type your answer..."
            className={styles.textInput}
          />
          <button className={styles.submitButton} onClick={handleAdjectiveSubmit}>Submit</button>
        </div>
        <div className={`feedback ${adjectiveFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
          {adjectiveFeedback}
        </div>
        <button className="next-button" disabled={!adjectiveAnswered} title={!adjectiveAnswered ? "Please answer first" : ""} onClick={nextAdjectiveQuestion}>Next</button>
      </>
      )}
      {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
    </div>
  );
};

class NoAdjectiveFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoAdjectiveFoundError";
  }
}


export default GenderQuiz;