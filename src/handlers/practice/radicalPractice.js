import { RadicalSelectionModal, EVENTS as SELECTION_EVENTS } from "../../components/modals/radicalSelection/index";
import { ReviewSessionModal, REVIEW_EVENTS } from "../../components/modals/reviewSession/index";
import { disableScroll, enableScroll, ReviewSession } from "./shared/index";
import { getCurrentLevelRadicals } from "../../services/wkof/index";
import { styles } from "../../constants";

export async function handleRadicalPractice() {
    try {
        disableScroll();
        const radicals = await getCurrentLevelRadicals();
        
        const selectionModal = new RadicalSelectionModal(radicals)
            .on(SELECTION_EVENTS.CLOSE, () => {
                enableScroll();
                selectionModal.remove();
            })
            .on(SELECTION_EVENTS.START_REVIEW, (selectedRadicals) => {
                selectionModal.remove();
                startRadicalReview(selectedRadicals);
            });

        await selectionModal.render();

    } catch (error) {
        console.error("Error in radical practice:", error);
        enableScroll();
    }
}

// Executed after user presses "Start Review" button
async function startRadicalReview(selectedRadicals) {
    try {
        const reviewSession = new ReviewSession(selectedRadicals);
        reviewSession.nextItem(); // Initialize first item

        const reviewModal = new ReviewSessionModal(reviewSession);

        reviewModal
            .on(REVIEW_EVENTS.CLOSE, () => {
                const progress = reviewSession.getProgress();
                const percentageCorrect = Math.round((progress.current / progress.total) * 100);
                // Make a new modal here or replace the text in the current modal then have a setTimeout. Maybe have a motivational quote here? 
                $("#ep-review-modal-header").remove();
                $("#ep-review-content")
                    .empty()
                    .append("<div>")
                        .css(styles.reviewModal.content)
                        .append([
                            $("<p>", { 
                                css: {
                                    ...styles.reviewModal.progress,
                                    marginBottom: 0
                                },
                                text: `${progress.current}/${progress.total} Correct (${progress.percentComplete}%)` 
                        }), 
                            $("<p>", {
                                css: {
                                    marginTop: 0,
                                    textAlign: "center"
                                },
                                text: "Closing in 3 seconds..."

                            })
                        ])

                setTimeout(() => {
                    enableScroll();
                    reviewModal.remove();
                }, 3000);
            })
            .on(REVIEW_EVENTS.COMPLETE, ({ progress }) => {
            })
            .on(REVIEW_EVENTS.ANSWER_SUBMITTED, ({ isCorrect, answer }) => {
            })
            .on(REVIEW_EVENTS.STUDY_AGAIN, () => {
                reviewModal.remove();
                enableScroll();
                handleRadicalPractice();
            });

        await reviewModal.render();
    } catch (error) {
        console.error("Error in startRadicalReview:", error);
        enableScroll();
    }
}