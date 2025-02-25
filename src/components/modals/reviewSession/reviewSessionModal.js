import { reviewModalTemplate, styles, theme, PRACTICE_MODES, ENDLESS_MODES } from "../../../constants/index";
import { REVIEW_STATES, REVIEW_EVENTS } from "./types";
import { ReviewCard } from "./reviewCard";
import { KanjiReviewSession, RadicalReviewSession } from "../../../handlers/practice/shared/index";
import { enableScroll } from "../../../handlers/practice/shared/modalHandler";
import { handleKanjiPractice, handleRadicalPractice } from "../../../handlers/practice/index";


export class ReviewSessionModal {
    constructor(reviewSession) {
        this.reviewSession = reviewSession;
        this.state = REVIEW_STATES.ANSWERING;
        this.$modal = null;
        this.currentCard = null;
        this.callbacks = new Map();
        this.isKanjiSession = !!this.reviewSession.correctMeanings;

        // Session configuration for Play Again
        this.sessionConfig = {
            mode: this.reviewSession.mode,
            items: this.reviewSession.originalItems,
            endlessMode: this.reviewSession.endlessMode
        }

        if (this.sessionConfig.mode !== "radical") {
            this.sessionConfig.allUnlockedKanji = this.reviewSession.allUnlockedKanji;
        }
    
        this.handlePlayAgain = this.handlePlayAgain.bind(this);
        this.handleAnswer = this.handleAnswer.bind(this);
        this.handleNextItem = this.handleNextItem.bind(this);
        this.showHint = this.showHint.bind(this);
        this.setupInput = this.setupInput.bind(this);
        this.showCurrentItem = this.showCurrentItem.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.showReviewInterface = this.showReviewInterface.bind(this);
        this.hideReviewInterface = this.hideReviewInterface.bind(this);
        this.showInputInterface = this.showInputInterface.bind(this);
        this.hideInputInterface = this.hideInputInterface.bind(this);
        this.showCompletionScreen = this.showCompletionScreen.bind(this);
    }

    // Setup Hiragana Keyboard
    setupInput() {
        const input = document.querySelector("#ep-review-answer");
        if (!input) return;

        const currentItem = this.reviewSession.currentItem;
        if (!currentItem) return;

        if (this.isKanjiSession && currentItem.type === "reading") {
            wanakana.bind(input, {
                IMEMode: "toHiragana",
                useObsoleteKana: false,
                passRomaji: false,
                upcaseKatakana: false,
                convertLongVowelMark: true
            });
        }
    }

    on(event, callback) {
        this.callbacks.set(event, callback);
        return this;
    }

    emit(event, data) {
        const callback = this.callbacks.get(event);
        if (callback) callback(data);
    }

    handlePlayAgain() {
        const newSession = this.isKanjiSession ? new KanjiReviewSession({
            items: this.sessionConfig.items,
            mode: this.sessionConfig.mode,
            allUnlockedKanji: this.sessionConfig.allUnlockedKanji
        }) : new RadicalReviewSession({
            items: this.sessionConfig.items,
            mode: "radical",
        });

        // Initialize new session
        newSession.nextItem();

        // Clean up current modal
        this.remove();

        const newModal = new ReviewSessionModal(newSession);
        newModal
            .on(REVIEW_EVENTS.CLOSE, () => {
                enableScroll();
                newModal.remove();
            })
            .on(REVIEW_EVENTS.STUDY_AGAIN, () => {
                newModal.remove();
                enableScroll();
                if (this.isKanjiSession) {
                    handleKanjiPractice();
                } else {
                    handleRadicalPractice();
                }
            });
        
            return newModal.render();
    }

    updateProgress() {
        const progress = this.reviewSession.getProgress();
        const mode = this.reviewSession.mode;

        if (this.reviewSession.endlessMode !== ENDLESS_MODES.DISABLED) {
            const endlessType = this.reviewSession.endlessMode === ENDLESS_MODES.HARDCORE ? "Hardcore" : "Normal";
            let progressText = `${endlessType} Endless | Current Streak: ${progress.currentStreak}`;
            
            if (progress.highScore > 0) {
                progressText += ` | High Score: ${progress.highScore}`;
            }
            
            $("#ep-review-progress-correct").html(progressText);
            // Add a small indicator showing this is an endless session
            $("#ep-review-exit").text("End Endless Session");
            return;
        }

        let progressText;

        switch (mode) {
            case PRACTICE_MODES.ENGLISH_TO_KANJI:
                progressText = `${progress.recognitionProgress}/${progress.total} Correct`;
                break;
            case PRACTICE_MODES.COMBINED:
                progressText = `Meanings: ${progress.meaningProgress}/${progress.total/3} | ` +
                             `Readings: ${progress.readingProgress}/${progress.total/3} | ` +
                             `Recognition: ${progress.recognitionProgress}/${progress.total/3}`;
                break;
            case PRACTICE_MODES.STANDARD:
                progressText = `Meanings: ${progress.meaningProgress}/${progress.total/2} | ` +
                             `Readings: ${progress.readingProgress}/${progress.total/2}`;
                break;
            default: // RADICAL 
                progressText = `${progress.current}/${progress.total/1} Correct`;
        }

        $("#ep-review-progress-correct").html(progressText);

        if (mode === PRACTICE_MODES.COMBINED) {
            $("#ep-review-progress-correct").css({
                fontSize: theme.typography.fontSize.xs
            });
        }
        
    }

    showReviewInterface() {
        $("#ep-review-result").show();
        $("#ep-review-result-message").show();
        $("#ep-review-explanation").show();
        $(".ep-review-buttons").hide();
    }

    hideReviewInterface() {
        $("#ep-review-result").hide();
        $("#ep-review-result-message").hide();
        $("#ep-review-explanation").hide();
        $("#ep-review-show-hint").hide();
        $(".ep-review-buttons").show();
    }

    showInputInterface() {
        $("#ep-review-input-section").show();
        $("#ep-review-answer").val("").prop("disabled", false);
        $("#ep-review-submit").show();
        $("#ep-review-answer").focus();

        this.setupInput();
    }

    hideInputInterface() {
        $("#ep-review-input-section").hide();
        $("#ep-review-submit").hide();
        $("#ep-review-answer").prop("disabled", true);
    }

    async showCurrentItem() {
        const currentItem = this.reviewSession.currentItem;
        
        if (this.currentCard) {
            this.currentCard.remove();
        }
    
        this.state = REVIEW_STATES.ANSWERING;
        this.hideReviewInterface();
        
        this.currentCard = new ReviewCard(currentItem, REVIEW_STATES.ANSWERING);
        const $card = await this.currentCard.render();
        
        // Clear and append the new card
        $("#ep-review-content").empty().append($card);
        
        // Ensure input is focused after rendering
        if (currentItem.type !== "recognition") {
            const $input = $("#ep-review-answer");
            if ($input.length) {
                $input.focus();
                this.setupInput();
            }
        }
    }

    async handleAnswer() {
        const currentCard = this.currentCard;
        if (!currentCard) return;
    
        const userAnswer = currentCard.getAnswer();
        if (!userAnswer) return;
    
        const isCorrect = this.reviewSession.checkAnswer(userAnswer);
        
        $(".ep-review-input-section, .ep-review-question, .ep-review-content, .kanji-option, #ep-review-submit").hide();
        $(".ep-review-character").css({
            marginBottom: "0"
        });
    
        // Create result container if it doesn't exist
        if ($("#ep-review-result-container").length === 0) {
            $(".ep-review-card").append(
                $("<div>")
                    .attr("id", "ep-review-result-container")
                    .css({
                        ...styles.reviewModal.content,
                        padding: 0
                    })
            );
        }
    
        if (isCorrect) {
            $("#ep-review-result-container")
                .empty()
                .append(
                    $("<div>")
                        .attr("id", "ep-review-result-message")
                        .text("Correct!")
                        .css({
                            ...styles.reviewModal.results.message,
                            color: theme.colors.success,
                        })
                );
                
            this.updateProgress();
            setTimeout(() => this.handleNextItem(), 1000);
        } else {
            let resultMessage = "Incorrect";

            if (this.reviewSession.endlessMode === ENDLESS_MODES.HARDCORE) {
                resultMessage = "Incorrect - Score Reset to 0!";
            }

            $("#ep-review-result-container")
                .empty()
                .append(
                    $("<div>")
                        .attr("id", "ep-review-result-message")
                        .text(resultMessage)
                        .css({
                            ...styles.reviewModal.results.message,
                            color: theme.colors.error,
                        }),
                    $("<div>")
                        .addClass("ep-review-buttons")
                        .css({ 
                            display: "flex",
                            gap: theme.spacing.md,
                            justifyContent: "center" 
                        })
                        .append(
                            $("<button>")
                                .attr("id", "ep-review-show-hint")
                                .text("Show Answer")
                                .css({
                                    ...styles.reviewModal.buttons.hint,
                                    minWidth: "120px"
                                }),
                            $("<button>")
                                .attr("id", "ep-review-continue")
                                .text("Continue Review")
                                .css({
                                    ...styles.reviewModal.buttons.submit,
                                    minWidth: "120px"
                                })
                        )
                );
        }
    }

    async showHint() {
        await this.currentCard.updateState(REVIEW_STATES.REVIEWING);
    }

    async handleNextItem() {
        if (!this.reviewSession.isComplete()) {
            this.reviewSession.nextItem();
            await this.showCurrentItem();
            this.emit(REVIEW_EVENTS.NEXT_ITEM);
        } else {
            this.showCompletionScreen();
        }
    }

    showCompletionScreen() {
        const progress = this.reviewSession.getProgress();
        const mode = this.reviewSession.mode;
        
        let languageLearningQuotes;

        if (this.isKanjiSession) {
            languageLearningQuotes = [
                "Every kanji you learn unlocks new understanding",
                "One character a day",
                "Continuation is power",
                "Each review strengthens your kanji recognition",
                "Little by little, steadily",
                "Each character you master opens new doors to understanding",
                "Your journey through the world of kanji grows stronger each day"
            ]; 
        } else {
            languageLearningQuotes = [
                "Every radical mastered unlocks new understanding",
                "Building your foundation, one radical at a time",
                "Mastering radicals today, recognizing kanji tomorrow",
                "Each radical review strengthens your foundation",
                "Little by little, your radical knowledge grows",
                "Each radical you master opens new paths of understanding",
                "Your journey through radicals grows stronger each day",
                "Steady progress in radicals paves the way forward",
                "Your radical knowledge builds the bridge to comprehension"
            ];
        }
        
        const randomQuote = languageLearningQuotes[
            Math.floor(Math.random() * languageLearningQuotes.length)
        ];

        let completionMessage;

        if (this.reviewSession.endlessMode !== ENDLESS_MODES.DISABLED) {
            const endlessType = this.reviewSession.endlessMode === ENDLESS_MODES.HARDCORE ? "Hardcore" : "Normal";
            completionMessage = `${endlessType} Endless Session Completed!<br>` +
                `Final Streak: ${progress.currentStreak} | High Score: ${progress.highScore}`;
        } else {
            switch (mode) {
                case PRACTICE_MODES.ENGLISH_TO_KANJI:
                    completionMessage = `Review completed!<br>${progress.recognitionProgress}/${progress.total} Correct`;
                    break;
                case PRACTICE_MODES.COMBINED:
                    completionMessage = `Review completed!<br>` +
                        `Meanings: ${progress.meaningProgress}/${progress.total/3} | ` +
                        `Readings: ${progress.readingProgress}/${progress.total/3} | ` +
                        `Recognition: ${progress.recognitionProgress}/${progress.total/3}`;
                    break;
                case PRACTICE_MODES.STANDARD:
                    completionMessage = `Review completed!<br>` +
                        `Meanings: ${progress.meaningProgress}/${progress.total/2} | ` +
                        `Readings: ${progress.readingProgress}/${progress.total/2}`;
                    break;
                default:
                    completionMessage = `Review completed!<br>${progress.current}/${progress.total} Correct`;
            }
        }

        const $completionContent = $("<div>")
            .css({
                textAlign: "center",
                padding: theme.spacing.xl
            })
            .append(
                $("<h1>")
                    .html(completionMessage)
                    .css({
                        ...styles.reviewModal.progress,
                        marginBottom: theme.spacing.lg
                    }),
                $("<p>")
                    .text(`"${randomQuote}"`)
                    .css({
                        color: theme.colors.gray[600],
                        marginBottom: theme.spacing.xl,
                        fontStyle: "italic"
                    }),
                    $("<div>")
                    .css({
                        display: "flex",
                        gap: theme.spacing.md,
                        justifyContent: "center"
                    })
                    .append(
                        $("<button>")
                            .text("Play Again")
                            .css({
                                ...styles.reviewModal.buttons.submit,
                                backgroundColor: theme.colors.success,
                                minWidth: "120px"
                            })
                            .on("click", this.handlePlayAgain),
                        $("<button>")
                            .text("Study Different Items")
                            .css({
                                ...styles.reviewModal.buttons.submit,
                                minWidth: "120px"
                            })
                            .on("click", () => {
                                this.emit(REVIEW_EVENTS.STUDY_AGAIN);
                            })
                    )
            );

        $("#ep-review-content").empty().append($completionContent);
        this.emit(REVIEW_EVENTS.COMPLETE, { progress });
    }

    async render() {
        this.$modal = $(reviewModalTemplate).appendTo("body");
        
        this.$modal.css({
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: theme.zIndex.modal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        });

        $("#ep-review-modal-wrapper").css(styles.reviewModal.container);
        $("#ep-review-modal-header").css(styles.reviewModal.header);
        $("#ep-review-progress").css(styles.reviewModal.progress);
        $("#ep-review-exit").css(styles.reviewModal.buttons.exit);

        // Set up event delegation
        this.$modal
            .on("click", "#ep-review-submit", this.handleAnswer)
            .on("keypress", "#ep-review-answer", (e) => {
                if (e.which === 13) {
                    this.handleAnswer();
                }
            })
            .on("click", "#ep-review-show-hint", this.showHint)
            .on("click", "#ep-review-continue", this.handleNextItem);

        $("#ep-review-exit").on("click", () => {
            this.emit(REVIEW_EVENTS.CLOSE);
        });

        this.updateProgress();
        await this.showCurrentItem();

        return this.$modal;
    }

    remove() {
        if (this.currentCard) {
            this.currentCard.remove();
        }

        const input = document.querySelector("#ep-review-answer");
        if (input) {
            wanakana.unbind(input);
        }

        if (this.$modal) {
            this.$modal.remove();
            this.$modal = null;
        }
    }
}