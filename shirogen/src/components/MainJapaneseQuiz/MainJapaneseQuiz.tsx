import React, { useState, useEffect } from 'react';
import styles from "./MainJapaneseQuiz.module.css";

import jlpt5Data from '../../res/japanese/jlpt_n5_words.json'
import jlpt4Data from '../../res/japanese/jlpt_n4_words.json';
import jlpt3Data from '../../res/japanese/jlpt_n3_words.json';

interface Sense {
  english_definitions: string[];
  parts_of_speech: string[];
}

interface JapaneseWord {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: {
    word?: string;
    reading: string;
  }[];
  senses: Sense[];
  attribution: {
    jmdict: boolean | string;
    jmnedict: boolean | string;
    dbpedia: boolean | string;
  };
}

const wordLists: Record<string, JapaneseWord[]> = {
  N5: Object.values(jlpt5Data),
  N4: Object.values(jlpt4Data),
  N3: Object.values(jlpt3Data),
};

const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const MainJapaneseQuiz = () => {
  const [selectedList, setSelectedList] = useState<string>('N5');
  const [currentWord, setCurrentWord] = useState<JapaneseWord | null>(null);
  const [choices, setChoices] = useState<JapaneseWord[]>([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackJp, setFeedbackJp] = useState('');
  const [wordAnswered, setWordAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);

  useEffect(() => {
    generateNewQuestion();
  }, [selectedList]);

  const generateNewQuestion = () => {
    const words = wordLists[selectedList];
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    const correctDefinition = selectedWord.senses[0]?.english_definitions[0];

    const distractors = new Set<JapaneseWord>();
    while (distractors.size < 2) {
      const random = words[Math.floor(Math.random() * words.length)];
      if (random.senses[0]?.english_definitions[0] && random.senses[0]?.english_definitions[0] !== correctDefinition) {
        distractors.add(random);
      }
    }

    const allChoices = shuffle([selectedWord, ...Array.from(distractors)]);
    setCurrentWord(selectedWord);
    setChoices(allChoices);
    setFeedback('');
    setFeedbackJp('');
    setWordAnswered(false);
  };

  const handleChoice = (selected: JapaneseWord) => {
    if (!currentWord) return;

    const correctDefinition = currentWord.senses[0]?.english_definitions[0];
    const isCorrect = selected.senses[0]?.english_definitions[0] === correctDefinition;

    setFeedback(
      isCorrect
        ? `Correct! Reading: `
        : `Wrong! This would be: `
    );
    setFeedbackJp(
      isCorrect
        ? `${selected.japanese[0].reading}`
        : `${selected.japanese[0].word ? `${selected.japanese[0].word} / ` : ""}${selected.japanese[0].reading}`
    );
    setWordAnswered(true);

    if (!wordAnswered) {
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      } else {
        setIncorrectAnswers((prev) => prev + 1);
      }
    }
    setWordAnswered(true)
  };

  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  const incorrectPercentage = totalAnswers === 0 ? 0 : 100 - correctPercentage;

  if (!currentWord) return <div>Loading...</div>;

  const kanjiDisplay = currentWord.japanese[0]?.word || currentWord.japanese[0]?.reading;

  return (
    <div className="quiz-container">
      <div className="wordListSelector">
        <select className="listSelect" value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
          {Object.keys(wordLists).map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
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
              style={{ width: `${correctPercentage}%` }}
            />
            <div
              className="progress-bar incorrect"
              style={{ width: `${incorrectPercentage}%` }}
            />
          </div>
        </div>
      <div className={styles.japaneseQuizContainer}>
        <h2>What does <strong className="emphasizeText">{kanjiDisplay}</strong> mean?</h2>
        <div className={styles.multipleChoiceContainer}>
          {choices.map((choice, idx) => (
            <button
            className={styles.multipleChoiceButton}
            key={idx}
            onClick={() => handleChoice(choice)}
            >
              {choice.senses[0]?.english_definitions[0]}
            </button>
          ))}
        </div>

        <div className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>
          {feedback} <strong className={styles.feedbackJp}>{feedbackJp}</strong>
        </div>

        <button className="next-button" onClick={generateNewQuestion} disabled={!wordAnswered} title={!wordAnswered ? "Please answer first" : ""}>
          Next
        </button>
      </div>
    </div>
  );
};

export default MainJapaneseQuiz;