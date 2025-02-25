import { ENDLESS_MODES } from "../../../constants/index";
import BaseReviewSession from "./baseReviewSession";

class RadicalReviewSession extends BaseReviewSession {
    constructor(config) {
        super(config.items);
        this.remainingItems = this.shuffleArray([...config.items]);
        this.correctAnswers = new Set();

        this.endlessMode = config.endlessMode || ENDLESS_MODES.DISABLED;
        this.highScore = 0;
        this.currentStreak = 0;
    }

    nextItem() {
        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            // In endless mode, if we run out of items, reset and shuffle again
            if (this.remainingItems.length === 0) {
                this.remainingItems = this.shuffleArray([...this.originalItems]);
            }
            this.currentItem = this.remainingItems.shift();
            return this.currentItem;
        }

        if (this.remainingItems.length === 0) {
            const remainingUnlearned = this.originalItems.filter(item => !this.correctAnswers.has(item.id));

            if (remainingUnlearned.length === 1) {
                this.remainingItems = remainingUnlearned;
            } else {
                this.remainingItems = this.shuffleArray(
                    remainingUnlearned.filter(item => !this.currentItem || item.id !== this.currentItem.id)
                );
            }
        }
        this.currentItem = this.remainingItems.shift();
        return this.currentItem;
    }

    checkAnswer(userAnswer) {
        const isCorrect = this.currentItem.meaning.toLowerCase() === userAnswer.toLowerCase();
        if (isCorrect) {
            this.correctAnswers.add(this.currentItem.id);

            if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
                this.currentStreak++;
                this.updateHighScore();
            }
        } else {
            if (this.endlessMode === ENDLESS_MODES.HARDCORE) {
                this.currentStreak = 0;
            }
        }
        return isCorrect;
    }

    updateHighScore() {
        if (this.currentStreak > this.highScore) {
            this.highScore = this.currentStreak;
        }
    }

    isComplete() {
        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            // Endless mode is never complete automatically
            return false;
        }

        return this.correctAnswers.size === this.originalItems.length;
    }

    getProgress() {
        const totalRadicals = this.originalItems.length;
        let current = this.correctAnswers.size;

        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            return {
                current: this.currentStreak,
                total: Infinity,
                highScore: this.highScore,
                currentStreak: this.currentStreak,
                endlessMode: this.endlessMode
            };
        }

        return {
            current,
            total: totalRadicals,
            remaining: totalRadicals - current,
            percentComplete: Math.round((current / totalRadicals) * 100)
        };
    }
}

export default RadicalReviewSession;