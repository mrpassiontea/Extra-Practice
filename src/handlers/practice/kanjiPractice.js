import { KanjiSelectionModal, EVENTS as SELECTION_EVENTS } from "../../components/modals/kanjiSelection/index";
import { ReviewSessionModal, REVIEW_EVENTS } from "../../components/modals/reviewSession/index";
import { disableScroll, enableScroll } from "./shared/modalHandler";
import { KanjiReviewSession } from "./shared/index";
import { getCurrentLevelKanji } from "../../services/wkof/index";
import { styles, PRACTICE_MODES } from "../../constants/index";

export async function handleKanjiPractice() {
    try {
        disableScroll();
        const kanji = await getCurrentLevelKanji();
        
        const selectionModal = new KanjiSelectionModal(kanji, kanji)  // Using current level kanji as unlocked list for now
            .on(SELECTION_EVENTS.CLOSE, () => {
                enableScroll();
                selectionModal.remove();
            })
            .on(SELECTION_EVENTS.START_REVIEW, (data) => {
                selectionModal.remove();
                startKanjiReview(data.kanji, data.mode, data.allUnlockedKanji);
            });

        await selectionModal.render();

    } catch (error) {
        console.error("Error in kanji practice:", error);
        enableScroll();
    }
}

async function startKanjiReview(selectedKanji, mode, allUnlockedKanji) {
    try {
        const reviewSession = new KanjiReviewSession({ 
            items: selectedKanji, 
            mode: mode,
            allUnlockedKanji: allUnlockedKanji
        });
        
        reviewSession.nextItem();

        const reviewModal = new ReviewSessionModal(reviewSession);

        reviewModal
            .on(REVIEW_EVENTS.CLOSE, () => {
                const progress = reviewSession.getProgress();
                $("#ep-review-modal-header").remove();

                const closingContent = [$("<p>", {
                    css: {
                        marginTop: 0,
                        textAlign: "center"
                    },
                    text: "Closing..."
                })];

                $("#ep-review-content")
                    .empty()
                    .append(
                        $("<div>")
                            .css(styles.reviewModal.content)
                            .append((() => {
                                if (reviewSession.mode === PRACTICE_MODES.STANDARD) {
                                    closingContent.unshift($("<p>", { 
                                        css: {
                                            ...styles.reviewModal.progress,
                                            marginBottom: 0
                                        },
                                        text: `Meanings: ${progress.meaningProgress}/${progress.total/2} - Readings: ${progress.readingProgress}/${progress.total/2}`
                                    }));
                                    return closingContent;
                                } else if (reviewSession.mode === PRACTICE_MODES.ENGLISH_TO_KANJI) {
                                    closingContent.unshift($("<p>", { 
                                        css: {
                                            ...styles.reviewModal.progress,
                                            marginBottom: 0
                                        },
                                        text: `${progress.recognitionProgress}/${progress.total} Correct`
                                    }))
                                    return closingContent;
                                } else { // COMBINATION PRACTICE_MODE
                                    closingContent.unshift($("<p>", { 
                                        css: {
                                            ...styles.reviewModal.progress,
                                            marginBottom: 0
                                        },
                                        text: `Meanings: ${progress.meaningProgress}/${progress.total/3} | ` +
                                            `Readings: ${progress.readingProgress}/${progress.total/3} | ` +
                                            `Recognition: ${progress.recognitionProgress}/${progress.total/3}`
                                    }))
                                    return closingContent;
                                }
                            })())
                    );

                setTimeout(() => {
                    enableScroll();
                    reviewModal.remove();
                }, 1000);
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