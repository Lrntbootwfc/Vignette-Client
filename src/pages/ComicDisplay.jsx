// src/components/ComicDisplay.jsx
import React from 'react';

const ComicDisplay = ({ comic }) => {
    if (!comic) {
        return null;
    }

    return (
        <div className="comic-display">
            <h4 style={{textAlign: 'center'}}>Your Comic Strip</h4>
            <div className="comic-image-container">
                <img src={comic.comic_image} alt="Generated Comic" className="comic-image" />
            </div>
            {/* Add more info like date_generated etc. if desired */}
        </div>
    );
};

export default ComicDisplay;