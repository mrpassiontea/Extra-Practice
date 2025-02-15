import BaseReviewSession from "./baseReviewSession";

class RadicalReviewSession extends BaseReviewSession {
    constructor(selectedItems) {
        super(selectedItems);
        this.remainingItems = this.shuffleArray([...selectedItems]);
        this.correctAnswers = new Set();
    }

    nextItem() {
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
        }
        return isCorrect;
    }

    isComplete() {
        return this.correctAnswers.size === this.originalItems.length;
    }

    getProgress() {
        return {
            current: this.correctAnswers.size,
            total: this.originalItems.length,
            remaining: this.originalItems.length - this.correctAnswers.size,
            percentComplete: Math.round((this.correctAnswers.size / this.originalItems.length) * 100)
        };
    }
}

export default RadicalReviewSession;