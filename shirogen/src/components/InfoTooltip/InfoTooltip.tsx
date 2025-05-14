import React, {useState} from "react";
import styles from "./InfoTooltip.module.css";

type InfoTooltipProps = {
    updatePopupText: () => string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({updatePopupText} : { updatePopupText: () => string }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const togglePopup = () => {
        setMessage(updatePopupText())
        setShowPopup(prev => !prev)
    };

    // Respect Line Breaks
    const splitMessage = message.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
    ));

    return (
        <>
            <span className={styles.infoButton} onClick={togglePopup} aria-label="Show Information">i</span>

            {showPopup && (
                <div className={styles.infoButtonPopupContainer} onClick={togglePopup}>
                    <div className={styles.infoButtonPopup} onClick={e => e.stopPropagation()}>
                        <div>{splitMessage}</div>
                        <button className={styles.infoButtonPopupCloseButton} onClick={togglePopup}>
                            Close
                        </button>
                    </div>
                </div>
             )}
        </>
    )
};

export default InfoTooltip;