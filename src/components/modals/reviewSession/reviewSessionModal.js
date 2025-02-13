import { reviewModalTemplate, styles, theme } from "../../../constants/index";
import { REVIEW_STATES, REVIEW_EVENTS } from "./types";
import ReviewCard from "./reviewCard";

export class ReviewSessionModal {
    constructor(reviewSession) {
        this.reviewSession = reviewSession;
        this.state = REVIEW_STATES.ANSWERING;
        this.$modal = null;
        this.currentCard = null;
        this.callbacks = new Map();

        // Bind methods
        this.handleAnswer = this.handleAnswer.bind(this);
        this.handleNextItem = this.handleNextItem.bind(this);
        this.showHint = this.showHint.bind(this);
    }

    on(event, callback) {
        this.callbacks.set(event, callback);
        return this;
    }

    emit(event, data) {
        const callback = this.callbacks.get(event);
        if (callback) callback(data);
    }

    updateProgress() {
        const progress = this.reviewSession.getProgress();
        $("#ep-review-progress-correct").text(progress.current);
        $("#ep-review-progress-total").text(progress.total);
    }

    showReviewInterface() {
        $("#ep-review-result").show();
        $("#ep-review-result-message").show();
        $("#ep-review-explanation").show();
    }

    hideReviewInterface() {
        $("#ep-review-result").hide();
        $("#ep-review-result-message").hide();
        $("#ep-review-explanation").hide();
        $("#ep-review-show-hint").hide();
    }

    showInputInterface() {
        $("#ep-review-input-section").show();
        $("#ep-review-answer").val("").prop("disabled", false);
        $("#ep-review-submit").show();
        $("#ep-review-answer").focus();
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
        
        $("#ep-review-content").empty().append($card);
        this.showInputInterface();
    }

    async handleAnswer() {
        const userAnswer = $("#ep-review-answer").val()?.trim();
        if (!userAnswer) return;

        // Found in reviewSession.js
        const isCorrect = this.reviewSession.checkAnswer(userAnswer);
        
        $(".ep-review-input-section").hide();

        $('.ep-review-character').css({
            marginBottom: '0'
        })

        if (isCorrect) {
            // Show correct message, does this even append to anything? Does #ep-review-result exist?
            $('.ep-review-card')
                .append(
                    $('<div>')
                        .attr('id', 'ep-review-result-container')
                        .css({
                            ...styles.reviewModal.content,
                            padding: 0
                        })
                        .append($('<div>')
                        .attr('id', 'ep-review-result-message')
                        .text('Correct!')
                            .css({
                                ...styles.reviewModal.results.message,
                                color: theme.colors.success,
                            }))
                );
                
            this.updateProgress();
            setTimeout(() => this.handleNextItem(), 1500);
        } else {
            // Show incorrect message with options
            $('.ep-review-card')
                .append(
                    $('<div>')
                        .attr('id', 'ep-review-result-container')
                        .css({
                            ...styles.reviewModal.content,
                            padding: 0
                        })
                        .append(
                            $('<div>')
                                .attr('id', 'ep-review-result-message')
                                .text('Incorrect')
                                .css({
                                    ...styles.reviewModal.results.message,
                                    color: theme.colors.error,
                                }),
                            $('<div>')
                                .addClass('ep-review-buttons')
                                .css({ 
                                    display: 'flex',
                                    gap: theme.spacing.md,
                                    justifyContent: 'center' 
                                })
                                .append(
                                    $('<button>')
                                        .attr('id', 'ep-review-show-hint')
                                        .text('Show Answer')
                                        .css({
                                            ...styles.reviewModal.buttons.hint,
                                            minWidth: '120px'
                                        }),
                                    $('<button>')
                                        .attr('id', 'ep-review-continue')
                                        .text('Continue Review')
                                        .css({
                                            ...styles.reviewModal.buttons.submit,
                                            minWidth: '120px'
                                        })
                                )
                        )
                );
        }

        this.emit(REVIEW_EVENTS.ANSWER_SUBMITTED, { isCorrect, answer: userAnswer });
    }

    async showHint() {
        $("#ep-review-result").remove();

        await this.currentCard.updateState(REVIEW_STATES.REVIEWING);
    }

    async handleNextItem() {
        if (this.reviewSession.isComplete()) {
            this.showCompletionScreen();
            return;
        }

        this.reviewSession.nextItem();
        await this.showCurrentItem();
        this.emit(REVIEW_EVENTS.NEXT_ITEM);
    }

    showCompletionScreen() {
        const progress = this.reviewSession.getProgress();
        
        const languageLearningQuotes = [
            "Language is effort",
            "One character a day",
            "Continuation is power",
            "Learn by doing",
            "Little by little, steadily"
        ];
        
        const randomQuote = languageLearningQuotes[
            Math.floor(Math.random() * languageLearningQuotes.length)
        ];

        const $completionContent = $("<div>")
            .css({
                textAlign: "center",
                padding: theme.spacing.xl
            })
            .append(
                $("<h1>")
                    .text(`Review completed! ${progress.current}/${progress.total} Correct (${progress.percentComplete}%)`)
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
                $("<button>")
                    .text("Study Again?")
                    .css(styles.reviewModal.buttons.submit)
                    .on("click", () => {
                        this.emit(REVIEW_EVENTS.STUDY_AGAIN);
                        // The radical practice handler will handle reopening the selection modal
                    })
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
            // Need to look into the .on(REVIEW_EVENTS.CLOSE) and see if it implements the  exit modal with the progress, etc...
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
        if (this.$modal) {
            this.$modal.remove();
            this.$modal = null;
        }
    }
}

export default ReviewSessionModal;