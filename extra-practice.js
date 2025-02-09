// ==UserScript==
// @name         Extra Practice
// @namespace    https://github.com/mrpassiontea/WaniKani-Extra-Practice
// @version      2025-02-08
// @description  Practice your current level's Radicals and Kanji
// @author       mrpassiontea
// @match        https://www.wanikani.com/dashboard*
// @grant        none
// @grant        window.onurlchange
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @run-at       document-end
// ==/UserScript==

// HTML Templates
const modalTemplate = `
    <div id='ep-practice-modal'>
        <div id='ep-practice-modal-content'>
            <div id='ep-practice-modal-welcome'>
                <h1>Hello, <span id="username"></span></h1>
                <h2>Please select all the Radicals that you would like to include in your practice session</h2>
            </div>
            <button id='ep-practice-modal-select-all'>Select All</button>
            <div id='ep-practice-modal-grid'></div>
            <div id='ep-practice-modal-footer'>
                <button id='ep-practice-modal-start' disabled>Start Review (0 Selected)</button>
                <button id='ep-practice-modal-close'>Exit</button>
            </div>
        </div>
    </div>
`;

const reviewModalTemplate = `
    <div id='ep-review-modal'>
        <div id='ep-review-modal-wrapper'>
            <div id='ep-review-modal-header'>
                <div id='ep-review-progress'>
                    <span id='ep-review-progress-correct'>0</span>/<span id='ep-review-progress-total'>0</span> Correct
                </div>
                <button id='ep-review-exit'>End Review</button>
            </div>

            <div id='ep-review-content'>
                <div id='ep-review-character'></div>

                <div id='ep-review-input-section'>
                    <input type='text' id='ep-review-answer' placeholder='Enter meaning...' tabindex="1" autofocus />
                    <button id='ep-review-submit' tabindex="2">Submit</button>
                </div>

                <div id='ep-review-result' style='display: none;'>
                    <div id='ep-review-result-message'></div>
                    <button id='ep-review-show-hint' style='display: none;'>Show Answer</button>
                </div>

                <div id='ep-review-explanation' style='display: none;'>
                    <h3>
                        <span id='ep-review-meaning-label'>Meaning:</span>
                        <span id='ep-review-meaning'></span>
                    </h3>
                    <div class='mnemonic-container'>
                        <span id='ep-review-mnemonic-label'>Mnemonic:</span>
                        <div id='ep-review-mnemonic'></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// CSS Styles

// Buttons

const contentTitleDivStyling = {
  display: "flex",
  "justify-content": "space-between",
  "align-items": "center",
};

const practiceBtnRadicalStyling = {
  "margin-bottom": "16px",
  "background-color": "#0598e4",
  padding: "8px",
  "border-radius": "3px",
  color: "white",
  "font-weight": "500",
  cursor: "pointer"
};

const practiceBtnKanjiStyling = {
  "margin-bottom": "16px",
  "background-color": "#eb019c",
  padding: "8px",
  "border-radius": "3px",
  color: "white",
  "font-weight": "500",
  cursor: "pointer"
};

// Radical/Kanji Selection Modal Styling

const modalStyling = {
    container: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "1000"
    },
    welcomeTextContainer: {
        color: "white",
        textAlign: "center",
        fontSize: "1rem",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "750px"
    },
    welcomeTextUsername: {
        fontSize: "2rem",
        marginBottom: "1rem"
    },
    exitButton: {
        border: "1px solid white",
        backgroundColor: "rgb(255,255,255,0.9)",
        padding: "8px 16px",
        color: "black",
        fontWeight: "500",
        borderRadius: "3px",
        cursor: "pointer"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(100px, 1fr))",
        gap: "1rem",
        padding: "1em 2em",
        maxHeight: "50vh",
        maxWidth: "600px",
        margin: "0 auto",
        justifyContent: "center",
    },
    radical: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        padding: "1rem",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.2s ease"
    },
    radicalSelected: {
        background: "rgba(5, 152, 228, 0.3)",
        border: "2px solid #0598e4"
    },
    radicalCharacter: {
        fontSize: "2rem",
        color: "white"
    },
    radicalMeaning: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "0.875rem"
    },
    footer: {
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        maxWidth: "600px",
        gap: "1rem"
    },
    startButton: {
        background: "#0598e4",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        border: "none",
        fontWeight: "500",
        cursor: "pointer",
        transition: "opacity 0.2s ease",
        opacity: "1" 
    },
    startButtonDisabled: {
        opacity: "0.5",
        cursor: "not-allowed",
        pointerEvents: "none" 
    },
    selectAllButton: {
        color: "white",
        background: "transparent",
        border: "1px solid white",
        cursor: "pointer",
        fontSize: "0.875rem",
        marginBottom: "1rem",
        padding: "0.8em",
        borderRadius: "3px",
        fontWeight: "bold",
    },
    contentWrapper: {
        width: "100%",
        maxWidth: "800px",
        padding: "0 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    }
};

// Review Modal Styling
const reviewModalStyling = {
    backdrop: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: "1000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    container: {
        backgroundColor: "#FFF",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem",
        borderBottom: "1px solid #E5E7EB",
        gap: "1rem"
    },
    progress: {
        fontWeight: "bold",
        fontSize: "1.25rem",
        color: "#1F2937"
    },
    exitButton: {
        backgroundColor: "transparent",
        color: "#eb019c",
        border: "1px solid #eb019c",
        borderRadius: "4px",
        padding: "0.75rem 1.5rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    exitButtonHover: {
        backgroundColor: "#EFF6FF"
    },
    content: {
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        textAlign: "center"
    },
    character: {
        fontSize: "6rem",
        color: "#1F2937",
        marginBottom: "2rem"
    },
    inputSection: {
        width: "100%",
        display: "flex",
        gap: "1rem",
        marginBottom: "2rem" 
    },
    input: {
        flex: "1",
        padding: "0.75rem",
        fontSize: "1rem",
        borderRadius: "4px", 
        border: "1px solid #D1D5DB"
    },
    submitButton: {
        backgroundColor: "#3B82F6",
        color: "#FFF",
        padding: "0.75rem 1.5rem",  
        borderRadius: "4px",
        border: "none",
        fontWeight: "500", 
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    submitButtonHover: {
        backgroundColor: "#2563EB"  
    },
    resultMessage: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginBottom: "1rem",
        color: '#4A90E2'
    },
    correctMessage: {
        color: "#10B981"
    },
    incorrectMessage: {
        color: "#EF4444"
    },
    hintButton: { 
        backgroundColor: "transparent",
        color: "#3B82F6",
        border: "1px solid #3B82F6",
        borderRadius: "4px",
        padding: "0.75rem 1.5rem",
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    hintButtonHover: {
        backgroundColor: "#EFF6FF"
    },
    explanation: {
        lineHeight: "1.6",
        color: "#4B5563",
        fontSize: "1.125rem" 
    },
    meaningLabel: {
        display: "inline-block",
        fontWeight: "normal",
        fontSize: "1.25rem",
        color: "#1F2937",
        marginRight: "0.5rem"
    },
    meaningText: {
        display: "inline-block",
        fontWeight: "bold",
        fontSize: "1.25rem",
        color: "#1F2937"
    },
    mnemonicContainer: {
        marginTop: "1rem",
        textAlign: "left",
        lineHeight: "1.6"
    },
    mnemonicLabel: {
        display: "block",
        fontWeight: "bold",
        fontSize: "1.25rem",
        color: "#1F2937",
        marginBottom: "0.5rem"
    },
    mnemonic: {
        color: "#6B7280",
        fontSize: "1.125rem"
    },
    mnemonicHighlight: {
        backgroundColor: "#E5E7EB",
        padding: "0 0.25rem",
        borderRadius: "2px",
        color: "#1F2937"
    }
};

// ---

// Variables
const sectionLevelProgressDashboard = "section.dashboard__level-progress";
const divLevelProgressContent =
  "div.wk-panel__content div.level-progress-dashboard"; // [container for the Radical and Kanji]
const divContentWrapper = "div.level-progress-dashboard__content"; // [There is two of these, one for Radical and one for Kanji]
const divContentTitle = "div.level-progress-dashboard__content-title"; // [Append practice buttons to this div]
// ---

(async function () {
  "use strict";
  applyStyling();
  insertPracticeButtons();
})();

function insertPracticeButtons() {
    $(`<button id='ep-radical-btn'>Practice</button>`)
      .appendTo(
        `${divLevelProgressContent} ${divContentWrapper} ${divContentTitle}:first`
      )
      .css(practiceBtnRadicalStyling)
      .on("click", () => {
        handleRadiclePractice().catch(error => {
          console.error('Error handling radical practice:', error);
        });
      });
  
    $(`<button id='ep-kanji-btn'>Practice</button>`)
      .appendTo(
        `${divLevelProgressContent} ${divContentWrapper} ${divContentTitle}:last`
      )
      .css(practiceBtnKanjiStyling)
      .on("click", handleKanjiPractice);
  }

function applyStyling() {
  $(`${divLevelProgressContent} ${divContentWrapper} ${divContentTitle}`).css(
    contentTitleDivStyling
  );
}

function updateStartButtonState(startButton, selectedCount) {
    if (selectedCount > 0) {
        startButton
            .prop('disabled', false)
            .text(`Start Review (${selectedCount} Selected)`)
            .css(modalStyling.startButton)
            .css({
                'opacity': '1', 
                pointerEvents: 'inherit'
            });
    } else {
        startButton
            .prop('disabled', true)
            .text('Start Review (0 Selected)')
            .css({...modalStyling.startButton, ...modalStyling.startButtonDisabled});
    }
}

function updateRadicalSelection($element, isSelected) {
    if (isSelected) {
        $element.css({...modalStyling.radical, ...modalStyling.radicalSelected});
    } else {
        $element.css(modalStyling.radical);
    }
}

const svgCache = new Map();

async function loadSvgContent(url) {
    if (svgCache.has(url)) {
        return svgCache.get(url);
    }
    
    const response = await fetch(url);
    const svgContent = await response.text();
    svgCache.set(url, svgContent);
    return svgContent;
}

async function handleRadiclePractice() {
    disableScroll();
    const radicals = await getCurrentLevelRadicals();
    const selectedRadicals = new Set();
    const totalRadicalsInLevel = radicals.length;
    
    const $modal = $(modalTemplate).appendTo("body");
    $("#username").text($("p.user-summary__username:first").text());
    
    // Initialize CSS
    $modal.css(modalStyling.container);
    $("#ep-practice-modal-welcome").css(modalStyling.welcomeTextContainer);
    $("#ep-practice-modal-welcome h1").css(modalStyling.welcomeTextUsername);
    $("#ep-practice-modal-close").css(modalStyling.exitButton);
    $("#ep-practice-modal-grid").css(modalStyling.grid);
    $("#ep-practice-modal-footer").css(modalStyling.footer);
    $("#ep-practice-modal-start").css(modalStyling.startButton);
    $("#ep-practice-modal-select-all").css(modalStyling.selectAllButton);
    $("#ep-practice-modal-content").css(modalStyling.contentWrapper);

    function updateSelectAllButton() {
        const selectAllButton = $("#ep-practice-modal-select-all");
        if (selectedRadicals.size === totalRadicalsInLevel) {
            selectAllButton.text("Deselect All");
            selectAllButton.css({
                "color": "red",
                "border-color": "red"
            });
        } else {
            selectAllButton.text("Select All");
            selectAllButton.css({
                "color": "white",
                "border-color": "white"
            });
        }
    }

    const startButton = $("#ep-practice-modal-start");
    updateStartButtonState(startButton, 0);

    $("#ep-practice-modal-select-all").on("click", function() {
        const selectAllButton = $(this);
        const isSelectingAll = selectAllButton.text() === "Select All";

        if (isSelectingAll) {
            radicals.forEach(radical => {
                selectedRadicals.add(radical.id);
            });
            $('.radical-selection-item').each(function() {
                updateRadicalSelection($(this), true);
            });
        } else {
            selectedRadicals.clear();
            $('.radical-selection-item').each(function() {
                updateRadicalSelection($(this), false);
            });
        }

        updateSelectAllButton();
        updateStartButtonState($("#ep-practice-modal-start"), selectedRadicals.size);
    });
    
    radicals.forEach(radical => {
        const $radicalElement = $('<div>')
            .addClass('radical-selection-item')
            .css(modalStyling.radical)
            .append(
                $('<div>')
                    .addClass('radical-character')
                    .css(modalStyling.radicalCharacter)
                    .text(radical.character || '')
            )
            .on('click', function() {
                const $this = $(this);
                const isCurrentlySelected = selectedRadicals.has(radical.id);
                
                if (isCurrentlySelected) {
                    selectedRadicals.delete(radical.id);
                    updateRadicalSelection($this, false);
                } else {
                    selectedRadicals.add(radical.id);
                    updateRadicalSelection($this, true);
                }
                
                updateSelectAllButton();
                updateStartButtonState($("#ep-practice-modal-start"), selectedRadicals.size);
            });
            
        if (!radical.character && radical.svg) {
            loadSvgContent(radical.svg)
                .then(svgContent => {
                    $radicalElement.find('.radical-character').html(svgContent);
                    const svg = $radicalElement.find('svg')[0];
                    if (svg) {
                        svg.setAttribute('width', '100%');
                        svg.setAttribute('height', '100%');
                    }
                })
                .catch(error => {
                    console.error('Error loading SVG:', error);
                    $radicalElement.find('.radical-character').text(radical.meaning);
                });
        }
        
        $("#ep-practice-modal-grid").append($radicalElement);
    });
    
    $("#ep-practice-modal-close").on("click", function () {
        enableScroll();
        $modal.remove();
    });
    
    $("#ep-practice-modal-start").on("click", function() {
        if (selectedRadicals.size > 0) {
            const selectedRadicalsList = Array.from(selectedRadicals).map(id => 
                radicals.find(radical => radical.id === id)
            );
            const reviewSession = new ReviewSession(selectedRadicalsList);
            $modal.remove();
            startReviewSession(reviewSession);
            console.log('Starting review with radicals:', selectedRadicalsList);
        }
    });
}

function handleKanjiPractice() {}

function disableScroll() {
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  $("html, body").css({
    overflow: "hidden",
    height: "100%",
    position: "fixed",
    top: `-${scrollPosition}px`,
    width: "100%",
  });
}

function enableScroll() {
  const scrollPosition = parseInt($("html").css("top")) * -1;

  $("html, body").css({
    overflow: "auto",
    height: "auto",
    position: "static",
    top: "auto",
    width: "auto",
  });

  window.scrollTo(0, scrollPosition);
}

/* -- IndexDB Functions Below -- */

// Retrieves the current user's WaniKani level from IndexedDB storage
async function getCurrentUserLevel() {    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('wkof.file_cache', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const getUser = store.get('Apiv2.user');
            
            getUser.onsuccess = () => {
                const userData = getUser.result;
                resolve(userData.content.data.level);
            };
            
            getUser.onerror = () => {
                reject(new Error('Failed to retrieve user level'));
            };
        };
        
        request.onerror = () => {
            reject(new Error('Failed to open database'));
        };
    });
}

// Retrieves radicals matching the user's current level
async function getCurrentLevelRadicals() {
    try {
        const userLevel = await getCurrentUserLevel();
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('wkof.file_cache', 1);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['files'], 'readonly');
                const store = transaction.objectStore('files');
                const getSubjects = store.get('Apiv2.subjects');
                
                getSubjects.onsuccess = () => {
                    const subjectsData = getSubjects.result;
                    
                    const currentLevelRadicals = Object.values(subjectsData.content.data)
                        .filter(subject => 
                            subject.object === 'radical' && 
                            subject.data.level === userLevel
                        )
                        .map(radical => ({
                            id: radical.id,
                            character: radical.data.characters,
                            meaning: radical.data.meanings[0].meaning,
                            documentationUrl: radical.data.document_url,
                            meaningMnemonic: radical.data.meaning_mnemonic,
                            svg: radical.data.character_images.find(img => 
                                img.content_type === 'image/svg+xml'
                            )?.url || null
                        }));
                    
                    resolve(currentLevelRadicals);
                };
                
                getSubjects.onerror = () => {
                    reject(new Error('Failed to retrieve subjects data'));
                };
            };
            
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };
        });
    } catch (error) {
        console.error('Error in getCurrentLevelRadicals:', error);
        throw error;
    }
}

// Used to render list of Radicals and in the practice
function createRadicalElement(radical) {
    const container = document.createElement('div');
    container.className = 'radical-selection-item';
    
    if (radical.character) {
        // If we have the actual character, display it directly
        container.textContent = radical.character;
    } else if (radical.svg) {
        // If we only have SVG, fetch and inject it
        fetch(radical.svg)
            .then(response => response.text())
            .then(svgContent => {
                container.innerHTML = svgContent;
                // Ensure the SVG scales properly
                const svg = container.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                }
            })
            .catch(error => {
                console.error('Error loading SVG:', error);
                // Fallback to displaying the meaning if SVG fails
                container.textContent = radical.meaning;
            });
    }
    
    return container;
}

class ReviewSession {
    constructor(selectedRadicals) {
        console.log("in constructor", selectedRadicals);
        this.originalRadicals = selectedRadicals;
        this.remainingRadicals = this.shuffleArray([...selectedRadicals]);
        this.currentRadical = null;
        this.correctAnswers = new Set();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    nextRadical() {
        if (this.remainingRadicals.length === 0) {
            const remainingUnlearned = this.originalRadicals.filter(radical => !this.correctAnswers.has(radical.id));

            if (remainingUnlearned.length === 1) {
                this.remainingRadicals = remainingUnlearned;
            } else {
                this.remainingRadicals = this.shuffleArray(remainingUnlearned.filter(radical => !this.currentRadical || radical.id !== this.currentRadical.id));
            }
        }
        this.currentRadical = this.remainingRadicals.shift();
    }

    checkAnswer(userAnswer) {
        const isCorrect = this.currentRadical.meaning.toLowerCase() === userAnswer.toLowerCase();
        if (isCorrect) {
            this.correctAnswers.add(this.currentRadical.id);
        }
        return isCorrect;
    }

    isComplete() {
        return this.correctAnswers.size === this.originalRadicals.length;
    }

    getProgress() {
        return {
            current: this.correctAnswers.size,
            total: this.originalRadicals.length
        };
    }
}

function startReviewSession(reviewSession) {
    const $reviewBackdrop = $('<div>').css(reviewModalStyling.backdrop);
    const $reviewModal = $(reviewModalTemplate).appendTo($reviewBackdrop);
    $reviewBackdrop.appendTo('body');
    $reviewModal.find('#ep-review-modal-wrapper').css(reviewModalStyling.container);

    $("#ep-review-answer").on("keypress", function(e) {
        if (e.which === 13) {
            handleSubmit();
        }
    });

    $("#ep-review-modal-header").css(reviewModalStyling.header);
    $("#ep-review-content").css(reviewModalStyling.content);
    $("#ep-review-character").css(reviewModalStyling.character);
    $("#ep-review-input-section").css(reviewModalStyling.inputSection);
    $("#ep-review-answer").css(reviewModalStyling.input);
    $("#ep-review-submit").css(reviewModalStyling.submitButton);
    $("#ep-review-meaning-label").css(reviewModalStyling.meaningLabel);
    $("#ep-review-meaning").css(reviewModalStyling.meaningText);
    $("#ep-review-mnemonic").css(reviewModalStyling.mnemonic);
    $("#ep-review-result-message").css(reviewModalStyling.resultMessage);
    $("#ep-review-exit")
        .css(reviewModalStyling.exitButton)
        .on("mouseenter", function() {
            $(this).addClass(reviewModalStyling.exitButtonHover);
        })
        .on("mouseleave", function() {
            $(this).removeClass(reviewModalStyling.exitButtonHover);
        });
    $("#ep-review-show-hint").css(reviewModalStyling.hintButton);
    
    function showCurrentRadical() {
        const currentRadical = reviewSession.currentRadical;
        $("#ep-review-character").empty();
        
        if (currentRadical.character) {
            $("#ep-review-character").text(currentRadical.character);
        } else if (currentRadical.svg) {
            loadSvgContent(currentRadical.svg)
                .then(svgContent => {
                    $("#ep-review-character").html(svgContent);
                })
                .catch(error => {
                    console.error('Error loading SVG:', error);
                    $("#ep-review-character").text(currentRadical.meaning);
                });
        }
        
        $("#ep-review-answer").val("").focus();
        $("#ep-review-result").hide();
        $("#ep-review-explanation").hide();
        updateProgress();
    }

    function resetUIForNextCard() {
        showReviewInputSection();
        $("#ep-review-explanation").hide();
        $("#ep-review-character").css('marginBottom', '2rem');
        $("#ep-review-submit").show();
        $("#ep-review-answer").prop('disabled', false).focus();
        $("#ep-review-result").hide();
        $("#ep-review-result-message").hide();
        $("#ep-review-modal-header").css(reviewModalStyling.header);
    }

    function showCompletionUI() {
        const languageLearningQuotes = [
            "Language is effort",
            "One character a day",
            "Continuation is power",
            "Learn by doing",
            "Little by little, steadily"
        ];
    
        const randomQuote = languageLearningQuotes[Math.floor(Math.random() * languageLearningQuotes.length)];
    
        const progress = reviewSession.getProgress();
        $("#ep-review-progress-correct").text(progress.total);
        
        $("#ep-review-result-message")
            .text("Review completed!")
            .css(reviewModalStyling.resultMessage)
            .show();
    
        $("<p>")
            .text(`"${randomQuote}"`)
            .css({
                color: '#666',
                fontStyle: 'italic',
                textAlign: 'center',
                margin: '15px 0 0 0',
                fontSize: '0.9em'
            })
            .insertAfter("#ep-review-result-message");
    
        $("#ep-review-content").css("gap", "1rem");
        $("#ep-review-character").hide();
        $("#ep-review-input-section").hide();
        $("#ep-review-explanation").hide();
    
        $("<button>")
            .text("Study Again?")
            .css(reviewModalStyling.submitButton)
            .on("click", function() {
                enableScroll();
                $reviewModal.remove();
                $reviewBackdrop.remove();
                handleRadiclePractice();
            })
            .appendTo("#ep-review-content");
    }
    
    function updateProgress() {
        const progress = reviewSession.getProgress();
        $("#ep-review-progress").css(reviewModalStyling.progress);
        $("#ep-review-progress-correct").text(progress.current);
        $("#ep-review-progress-total").text(progress.total);
    }

    function hideReviewInputSection () {
        $("#ep-review-input-section").hide();
    }

    function showReviewInputSection () {
        $("#ep-review-input-section").show();
        $("#ep-review-answer").focus();
    }

    function renderContinueReviewBtn() {
        $("#continueReviewBtn").remove();
        
        const continueReviewBtn = $("<button id='continueReviewBtn'>")
            .text("Continue Review")
            .css(reviewModalStyling.submitButton)
            .on("click", function () {
                $(this).remove();
                if (reviewSession.isComplete()) {
                    showCompletionUI();
                } else {
                    resetUIForNextCard();
                    reviewSession.nextRadical();
                    showCurrentRadical();
                }
            });

             // Explicitly check both visibility and display
            if ($("#ep-review-explanation").is(':visible')) {
                continueReviewBtn.css("margin-top", "1rem").appendTo($("#ep-review-explanation"));
            } else if ($("#ep-review-content").is(':visible')) {
                continueReviewBtn.appendTo($("#ep-review-result"));
            }
    }
    
    function handleSubmit() {
        const userAnswer = $("#ep-review-answer").val().trim();
        const isCorrect = reviewSession.checkAnswer(userAnswer);
        
        if (isCorrect) {
            $("#ep-review-result-message").text("Correct!").css(reviewModalStyling.correctMessage).show();
            $("#ep-review-show-hint").hide();
            $("#ep-review-submit").hide();
            $("#ep-review-answer").prop('disabled', true);
            
            if (reviewSession.isComplete()) {
                showCompletionUI();
            } else {
                setTimeout(() => {
                    reviewSession.nextRadical();
                    showCurrentRadical();
                    $("#ep-review-submit").show();
                    $("#ep-review-answer").prop('disabled', false).focus();
                    $("ep-review-answer").prop('disabled', false);
                }, 1000);
            }
        } else {
            hideReviewInputSection();
            $("#ep-review-character").css('marginBottom', '0');
            $("#ep-review-result-message")
                .text("Incorrect")
                .css(reviewModalStyling.incorrectMessage);
            $("#ep-review-show-hint").show();
            renderContinueReviewBtn();  
        }
        $("#ep-review-result").show();
    }
    
    function showHint() {
        const currentRadical = reviewSession.currentRadical;
        $("#ep-review-input-section").hide();
        $("#ep-review-show-hint").hide();
        $("#ep-review-result-message").hide();
        $("#ep-review-character").css('marginBottom', '0');
        $("#ep-review-result").hide();
        $("#ep-review-meaning").text(currentRadical.meaning);

        // Remove the <mnemonic> text in our meaningMnemonic data
        const mnemonicText = currentRadical.meaningMnemonic;
        const processedMnemonicText = mnemonicText.replace(
            /<radical>(.*?)<\/radical>/g, 
            (match, content) => `<span class="mnemonic-highlight">${content}</span>`
        );

        // Apply mnemonic styling
        $("#ep-review-mnemonic").html(processedMnemonicText);
        $(".mnemonic-highlight").css(reviewModalStyling.mnemonicHighlight);
        $(".mnemonic-container").css(reviewModalStyling.mnemonicContainer);
        $("#ep-review-mnemonic-label").css(reviewModalStyling.mnemonicLabel);
        $("#ep-review-mnemonic").css(reviewModalStyling.mnemonic);

        $("#ep-review-explanation").show();
        renderContinueReviewBtn();
    }
    
    $("#ep-review-submit").on("click", handleSubmit);
    $("#ep-review-show-hint").on("click", showHint);
    $("#ep-review-exit").on("click", function() {
        const progress = reviewSession.getProgress();
        const percentageCorrect = Math.round((progress.current / progress.total) * 100);
        
        // Create a message based on their performance
        let performanceMessage = "";
        if (percentageCorrect === 100) {
            performanceMessage = "Perfect Practice! 🌟";
        } else if (percentageCorrect >= 80) {
            performanceMessage = "Great Job! 👏";
        } else if (percentageCorrect >= 50) {
            performanceMessage = "Keep Practicing! 💪";
        } else {
            performanceMessage = "Don't Give Up! 🌱";
        }

        // Create and prepend the performance message
        $("<h1>")
            .text(`${performanceMessage} ${progress.current}/${progress.total} Correct (${percentageCorrect}%)`)
            .css({
                color: '#333',
                textAlign: 'center',
                margin: '10px 0',
                fontWeight: 'bold',
            })
            .prependTo("#ep-review-modal-header");
        $("<p>")
            .text("Closing in 3 seconds...")
            .css({
                color: '#333',
                textAlign: 'center',
                margin: '0'
            })
            .appendTo("#ep-review-modal-header");
        $("#ep-review-modal-header").css({
            "borderBottom": "none",
            "flex-direction": "column",
        });
        $("#ep-review-progress").remove();    
        $("#ep-review-content").remove();
        $("#ep-review-exit").remove();
        setTimeout(() => {
            enableScroll();
            $reviewModal.remove();
            $reviewBackdrop.remove();
        }, 3000);
    });
    
    reviewSession.nextRadical();
    showCurrentRadical();
}