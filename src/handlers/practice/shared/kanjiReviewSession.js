import BaseReviewSession from "./baseReviewSession";

class KanjiReviewSession extends BaseReviewSession {
    constructor(selectedItems) {
        super(selectedItems);
        
        // Create all cards upfront
        const allCards = [];
        
        selectedItems.forEach(kanji => {
            // Add meaning card
            allCards.push({
                ...kanji,
                type: "meaning",
                questionType: "What is the meaning of this kanji?"
            });
            
            // Add reading card
            allCards.push({
                ...kanji,
                type: "reading",
                questionType: "What is the reading of this kanji?"
            });
        });

        // Shuffle all cards together
        this.remainingItems = this.shuffleArray(allCards);
        
        // Progress tracking
        this.correctMeanings = new Set();
        this.correctReadings = new Set();
        this.currentItem = null;
    }

    nextItem() {
        if (this.remainingItems.length === 0) {
            // Get items that haven't been answered correctly
            const remainingUnlearned = [];
            
            this.originalItems.forEach(kanji => {
                // Check if meaning needs review
                if (!this.correctMeanings.has(kanji.id)) {
                    remainingUnlearned.push({
                        ...kanji,
                        type: "meaning",
                        questionType: "What is the meaning of this kanji?"
                    });
                }
                
                // Check if reading needs review
                if (!this.correctReadings.has(kanji.id)) {
                    remainingUnlearned.push({
                        ...kanji,
                        type: "reading",
                        questionType: "What is the reading of this kanji?"
                    });
                }
            });

            // Shuffle the remaining items, excluding the current one if it exists
            if (remainingUnlearned.length > 1) {
                this.remainingItems = this.shuffleArray(
                    remainingUnlearned.filter(item => 
                        !this.currentItem || 
                        item.id !== this.currentItem.id || 
                        item.type !== this.currentItem.type
                    )
                );
            } else {
                this.remainingItems = remainingUnlearned;
            }
        }

        this.currentItem = this.remainingItems.shift();
        return this.currentItem;
    }

    checkAnswer(userAnswer) {
        if (!this.currentItem) return false;

        let isCorrect = false;
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        const userReading = userAnswer.trim();

        if (this.currentItem.type === "meaning") {
            // Check primary meanings
            isCorrect = this.currentItem.meanings.some(m => 
                m.meaning.toLowerCase() === normalizedUserAnswer
            );

            // Check auxiliary meanings if available
            if (!isCorrect && this.currentItem.auxiliaryMeanings.length > 0) {
                isCorrect = this.currentItem.auxiliaryMeanings.some(m => 
                    m.meaning.toLowerCase() === normalizedUserAnswer
                );
            }

            if (isCorrect) {
                this.correctMeanings.add(this.currentItem.id);
            }
        } else {
            // Reading type
            isCorrect = this.currentItem.readings.some(r => 
                r.reading === userReading
            );

            if (isCorrect) {
                this.correctReadings.add(this.currentItem.id);
            }
        }

        return isCorrect;
    }

    isComplete() {
        const meaningsCompleted = this.correctMeanings.size === this.originalItems.length;
        const readingsCompleted = this.correctReadings.size === this.originalItems.length;
        return meaningsCompleted && readingsCompleted;
    }

    getProgress() {
        const totalItems = this.originalItems.length * 2; // Each kanji has meaning and reading
        const totalCorrect = this.correctMeanings.size + this.correctReadings.size;

        return {
            current: totalCorrect,
            total: totalItems,
            remaining: totalItems - totalCorrect,
            percentComplete: Math.round((totalCorrect / totalItems) * 100),
            meaningProgress: this.correctMeanings.size,
            readingProgress: this.correctReadings.size
        };
    }
}

export default KanjiReviewSession;