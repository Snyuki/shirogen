import React, { useEffect, useRef, useState } from 'react';

import MainGermanQuiz from "./components/MainGermanQuiz"
import MainJapaneseQuiz from './components/MainJapaneseQuiz';

const QuizHandler = () => {
  const [selectedQuiz, setSelectedQuiz] = useState("german");

  return (
    <>
      <div className="quiz-toggle-bar">
        <button
            className={`quiz-toggle-button ${selectedQuiz === "german" ? "active" : ""}`}
            onClick={() => setSelectedQuiz("german")}
        >
            German
        </button>
        <button
            className={`quiz-toggle-button ${selectedQuiz === "japanese" ? "active" : ""}`}
            onClick={() => setSelectedQuiz("japanese")}
        >
            Japanese
        </button>
      </div>

      {selectedQuiz === "german" ? (
        <MainGermanQuiz />
      ) : (
        <MainJapaneseQuiz />
      )}
    </>
  );
};


export default QuizHandler;