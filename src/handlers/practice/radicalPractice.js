import { RadicalSelectionModal, EVENTS as SELECTION_EVENTS } from "../../components/modals/radicalSelection/index";
import { ReviewSessionModal, REVIEW_EVENTS } from "../../components/modals/reviewSession/index";
import { disableScroll, enableScroll } from "./shared/modalHandler";
import { RadicalReviewSession } from "./shared/index";
import { getCurrentLevelRadicals } from "../../services/wkof/index";
import { styles } from "../../constants/index";

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

async function startRadicalReview(selectedRadicals) {
    try {
        const reviewSession = new RadicalReviewSession(selectedRadicals);
        reviewSession.nextItem();

        const reviewModal = new ReviewSessionModal(reviewSession);

        reviewModal
            .on(REVIEW_EVENTS.CLOSE, () => {
                const progress = reviewSession.getProgress();
                $("#ep-review-modal-header").remove();
                $("#ep-review-content")
                    .empty()
                    .append(
                        $("<div>")
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
                    );

                setTimeout(() => {
                    enableScroll();
                    reviewModal.remove();
                }, 3000);
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