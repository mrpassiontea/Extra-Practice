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

// HTML Template
const modalTemplate = `
    <div id='ep-practice-modal'>
        <div id='ep-practice-modal-btn-close-container'>
            <button id='ep-practice-modal-close'>Close</button>
        </div>
        <div id='ep-practice-modal-content'>
            <div id='ep-practice-modal-welcome'>
                <h1>Hello, <span id="username"></span></h1>
                <h2>Please select all the Radicals that you would like to include in your practice session</h2>
            </div>
            <button id='ep-practice-modal-select-all'>Select All</button>
            <div id='ep-practice-modal-grid'></div>
            <div id='ep-practice-modal-footer'>
                <button id='ep-practice-modal-start' disabled>Start Review (0 Selected)</button>
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
};

const practiceBtnKanjiStyling = {
  "margin-bottom": "16px",
  "background-color": "#eb019c",
  padding: "8px",
  "border-radius": "3px",
  color: "white",
  "font-weight": "500",
};

// Modal Styling

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
    closeContainer: {
        position: "absolute",
        top: "2rem",
        right: "2rem",
        display: "flex",
        justifyContent: "flex-end",
        width: "auto"
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
        backgroundColor: "transparent",
        padding: "8px 16px",
        color: "white",
        fontWeight: "400",
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
        maxWidth: "600px"
    },
    startButton: {
        background: "#0598e4",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        border: "none",
        fontWeight: "500",
        cursor: "pointer",
        transition: "opacity 0.2s ease"
    },
    startButtonDisabled: {
        opacity: "0.5",
        cursor: "not-allowed"
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
            .css(modalStyling.startButton);
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
    $("#ep-practice-modal-btn-close-container").css(modalStyling.closeContainer);
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
        } else {
            selectAllButton.text("Select All");
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
            const selectedRadicalsList = Array.from(selectedRadicals);
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