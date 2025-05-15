import React, { useEffect, useRef, useState } from 'react';

import MainGermanQuiz from "./components/MainGermanQuiz"
import MainJapaneseQuiz from './components/MainJapaneseQuiz/MainJapaneseQuiz';

const QuizHandler = () => {
    const variable = false
    return (
        <>
            { variable ? ( 
                <MainGermanQuiz />
            ) : (
                <MainJapaneseQuiz />
            )
        }
        </>
    );
}

export default QuizHandler;