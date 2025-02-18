import BaseReviewSession from "./baseReviewSession";

class RadicalReviewSession extends BaseReviewSession {
    constructor(config) {
        super(config.items);
        this.remainingItems = this.shuffleArray([...config.items]);
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
        const totalRadicals = this.originalItems.length;
        let current = this.correctAnswers.size;

        return {
            current,
            total: totalRadicals,
            remaining: totalRadicals - current,
            percentComplete: Math.round((current / totalRadicals) * 100)
        };
    }
}

export default RadicalReviewSession;