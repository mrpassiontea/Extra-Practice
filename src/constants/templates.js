export const modalTemplate = `
    <div id="ep-practice-modal">
        <div id="ep-practice-modal-content">
            <div id="ep-practice-modal-welcome">
                <h1>Hello, <span id="username"></span></h1>
                <h2>Please select all the Radicals that you would like to include in your practice session</h2>
            </div>
            <button id="ep-practice-modal-select-all">Select All</button>
            <div id="ep-practice-modal-grid"></div>
            <div id="ep-practice-modal-footer">
                <button id="ep-practice-modal-start" disabled>Start Review (0 Selected)</button>
                <button id="ep-practice-modal-close">Exit</button>
            </div>
        </div>
    </div>
`;

export const reviewModalTemplate = `
    <div id="ep-review-modal">
        <div id="ep-review-modal-wrapper">
            <div id="ep-review-modal-header">
                <div id="ep-review-progress">
                    <span id="ep-review-progress-correct">0</span>
                </div>
                <button id="ep-review-exit">End Review</button>
            </div>

            <div id="ep-review-content">
                <div id="ep-review-character"></div>

                <div id="ep-review-input-section">
                    <input type="text" id="ep-review-answer" placeholder="Enter meaning..." tabindex="1" autofocus />
                    <button id="ep-review-submit" tabindex="2">Submit</button>
                </div>

                <div id="ep-review-result" style="display: none;">
                    <div id="ep-review-result-message"></div>
                    <button id="ep-review-show-hint" style="display: none;">Show Answer</button>
                </div>

                <div id="ep-review-explanation" style="display: none;">
                    <h3>
                        <span id="ep-review-meaning-label">Meaning:</span>
                        <span id="ep-review-meaning"></span>
                    </h3>
                    <div class="mnemonic-container">
                        <span id="ep-review-mnemonic-label">Mnemonic:</span>
                        <div id="ep-review-mnemonic"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;