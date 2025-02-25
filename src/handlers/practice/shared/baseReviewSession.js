import { ENDLESS_MODES } from "../../../constants/practiceMode";

class BaseReviewSession {
    constructor(selectedItems) {
        if (new.target === BaseReviewSession) {
            throw new Error("BaseReviewSession is an abstract class and cannot be instantiated directly.");
        }
        this.originalItems = selectedItems;
        this.currentItem = null;

        this.endlessMode = selectedItems.endlessMode || ENDLESS_MODES.DISABLED;
        this.highScore = 0; // Score for Endless Mode
        this.currentStreak = 0;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    nextItem() {
        throw new Error("nextItem() must be implemented by derived classes");
    }

    checkAnswer(userAnswer) {
        throw new Error("checkAnswer() must be implemented by derived classes");
    }

    isComplete() {
        throw new Error("isComplete() must be implemented by derived classes");
    }

    getProgress() {
        throw new Error("getProgress() must be implemented by derived classes");
    }

    handleCorrectAnswer(itemId) {

    }

    handleIncorrectAnswer() {
        if (this.endlessMode === ENDLESS_MODES.HARDCORE) {
            this.currentStreak = 0;
        }
    }

    updateHighScore() {
        if (this.currentStreak > this.highScore) {
            this.highScore = this.currentStreak;
        }
    }
}

export default BaseReviewSession;