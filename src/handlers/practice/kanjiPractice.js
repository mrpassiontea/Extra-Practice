import { KanjiSelectionModal, EVENTS as SELECTION_EVENTS } from "../../components/modals/kanjiSelection/index";
import { ReviewSessionModal, REVIEW_EVENTS } from "../../components/modals/reviewSession/index";
import { disableScroll, enableScroll } from "./shared/modalHandler";
import { KanjiReviewSession } from "./shared/index";
import { getCurrentLevelKanji } from "../../services/wkof/index";
import { styles } from "../../constants/index";

export async function handleKanjiPractice() {
    try {
        disableScroll();
        const kanji = await getCurrentLevelKanji();
        
        const selectionModal = new KanjiSelectionModal(kanji)
            .on(SELECTION_EVENTS.CLOSE, () => {
                enableScroll();
                selectionModal.remove();
            })
            .on(SELECTION_EVENTS.START_REVIEW, (selectedKanji) => {
                selectionModal.remove();
                startKanjiReview(selectedKanji);
            });

        await selectionModal.render();

    } catch (error) {
        console.error("Error in kanji practice:", error);
        enableScroll();
    }
}

async function startKanjiReview(selectedKanji) {
    try {
        const reviewSession = new KanjiReviewSession(selectedKanji);
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
                                    text: `Meanings: ${progress.meaningProgress}/${progress.total/2} - Readings: ${progress.readingProgress}/${progress.total/2}`
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
                handleKanjiPractice();
            });

        await reviewModal.render();
    } catch (error) {
        console.error("Error in startKanjiReview:", error);
        enableScroll();
    }
}