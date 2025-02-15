class BaseReviewSession {
    constructor(selectedItems) {
        if (new.target === BaseReviewSession) {
            throw new Error("BaseReviewSession is an abstract class and cannot be instantiated directly.");
        }
        this.originalItems = selectedItems;
        this.currentItem = null;
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
}

export default BaseReviewSession;