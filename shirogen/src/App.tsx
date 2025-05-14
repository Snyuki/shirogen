import React, { useEffect, useRef, useState } from 'react';

// components
import InfoTooltip from './components/InfoTooltip'

// import femaleNounsData from './res/german_female_nouns.json';
// import maleNounsData from './res/german_male_nouns.json';
// import neutralNounsData from './res/german_neutral_nouns.json';
import b1nounsData from './res/b1-nouns.json'
// import verbsData from './res/german_verbs.json';
import b1VerbsData from './res/b1-verbs.json'
import b1VerbsTensesConfig from './res/b1-verb-tenses-config.json'
import b1AdjectiveData from './res/b1-adjectives.json'
import b1AdjectiveConfig from './res/b1-adjective-config.json'

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

// const femaleNouns = Object.values(femaleNounsData)
// const maleNouns = Object.values(maleNounsData)
// const neutralNouns = Object.values(neutralNounsData)
const b1nouns = Object.values(b1nounsData)
const b1verbs = Object.values(b1VerbsData)
const b1adjectives = Object.values(b1AdjectiveData)

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

  function getRandomAdjective(attempts = 0): AdjectiveFormSelection {
    // Infinite recursion protection
    if (attempts > 10) {
      // TODO Should show Popup in the future
      throw new Error("No valid adjective form found after multiple attempts");
    }

    const randomAdjective = b1adjectives[Math.floor(Math.random() * b1adjectives.length)];
    const formOptions = b1AdjectiveConfig.Formen;
    const caseOptions = b1AdjectiveConfig.Kasi;
    const genderOptions = b1AdjectiveConfig.Gender;
    const specOptions = b1AdjectiveConfig.Specifications;
    // TODO Add binary value to config to just toggle each instead of hardcoding
  
    // Try all combinations in a randomized order for fairness
    const shuffledForms = shuffle([...formOptions]);
    const shuffledCases = shuffle([...caseOptions]);
    const shuffledGenders = shuffle([...genderOptions]);
    const shuffledSpecs = shuffle([...specOptions]);

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
      ) : mode === 'verb' ? (
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
      ) : (
        <>
        <h2>Enter the <strong>{adjectiveFormLabels[currentAdjective.form]}</strong> | <strong>{currentAdjective.gender}</strong> | <strong>{currentAdjective.case}</strong> | <strong>{adjectiveSpecLabels[currentAdjective.specification]}</strong> of <strong>
        <a 
            href={`https://translate.google.com/?sl=de&tl=ja&text=${encodeURIComponent(currentAdjective.baseForm)}&op=translate`}
            target="_blank"
            rel="noopener noreferrer"
            >
              {currentAdjective.baseForm}
            </a>
            </strong>: 
            <InfoTooltip 
            updatePopupText={updateAdjectivePopupText}/></h2>
        <div className="verb-input-row">
          <input
            type="text"
            ref={adjectiveInputRef}
            onKeyDown={handleKeyDown}
            value={adjectiveInput}
            onChange={(e) => setAdjectiveInput(e.target.value)}
            placeholder="Type your answer..."
            className="text-input short"
          />
          <button className="submit-button" onClick={handleAdjectiveSubmit}>Submit</button>
        </div>
        <div className={`feedback ${adjectiveFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
          {adjectiveFeedback}
        </div>
        <button className="next-button" disabled={!adjectiveAnswered} title={!adjectiveAnswered ? "Please answer first" : ""} onClick={nextAdjectiveQuestion}>Next</button>
      </>
      )}
    </div>
    
  );
};

export default GenderQuiz;