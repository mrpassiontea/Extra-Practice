import BaseReviewSession from "./baseReviewSession";
import { PRACTICE_MODES } from "../../../constants/index";

class KanjiReviewSession extends BaseReviewSession {
    constructor(config) {
        super(config.items);
        this.mode = config.mode || PRACTICE_MODES.STANDARD;
        this.allUnlockedKanji = config.allUnlockedKanji || [];
        this.allCards = [];
        this.remainingItems = [];
        
        // Progress tracking
        this.correctMeanings = new Set();
        this.correctReadings = new Set();
        this.correctRecognition = new Set();

        this.endlessMode = config.endlessMode || ENDLESS_MODES.DISABLED;
        this.highScore = 0;
        this.currentStreak = 0;
        
        // Initialize cards based on mode
        this.initializeCards();
    }

    initializeCards() {
        switch (this.mode) {
            case PRACTICE_MODES.STANDARD:
                this.initializeStandardCards();
                break;
            case PRACTICE_MODES.ENGLISH_TO_KANJI:
                this.initializeRecognitionCards();
                break;
            case PRACTICE_MODES.COMBINED:
                this.initializeStandardCards();
                this.initializeRecognitionCards();
                break;
        }
        
        // Shuffle all cards together
        this.remainingItems = this.shuffleArray([...this.allCards]);
    }

    initializeStandardCards() {
        this.originalItems.forEach(kanji => {
            // Add meaning card
            this.allCards.push({
                ...kanji,
                type: "meaning",
                questionType: "What is the meaning of this kanji?"
            });
            
            // Add reading card
            this.allCards.push({
                ...kanji,
                type: "reading",
                questionType: "What is the reading of this kanji?"
            });
        });
    }

    initializeRecognitionCards() {
        this.originalItems.forEach(kanji => {
            const primaryMeaning = kanji.meanings.find(m => m.primary)?.meaning;
            
            // Create recognition card
            this.allCards.push({
                ...kanji,
                type: "recognition",
                questionType: "Select the kanji that means",
                meaningToMatch: primaryMeaning,
                options: this.generateKanjiOptions(kanji)
            });
        });
    }

    generateKanjiOptions(correctKanji) {
        const numberOfOptions = 4;
        const options = [correctKanji];
        
        // Create a pool of incorrect options from the selected kanji
        const availableOptions = this.originalItems.filter(k => k.id !== correctKanji.id);

        
        // Randomly select additional options from the available pool
        while (options.length < numberOfOptions && availableOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableOptions.length);
            const selectedOption = availableOptions[randomIndex];
            options.push(selectedOption);
            availableOptions.splice(randomIndex, 1);
        }

        // If we still need more options (rare case when very few kanji are selected)
        // fill remaining slots with kanji from allUnlockedKanji
        if (options.length < numberOfOptions) {
            const additionalOptions = this.allUnlockedKanji.filter(k => 
                !options.some(selected => selected.id === k.id) && 
                !this.originalItems.some(selected => selected.id === k.id)
            );

            while (options.length < numberOfOptions && additionalOptions.length > 0) {
                const randomIndex = Math.floor(Math.random() * additionalOptions.length);
                const selectedOption = additionalOptions[randomIndex];
                options.push(selectedOption);
                additionalOptions.splice(randomIndex, 1);
            }
        }
        
        return this.shuffleArray(options);
    }

    nextItem() {
        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            // In endless mode, if we run out of items, reset and shuffle again
            if (this.remainingItems.length === 0) {
                this.remainingItems = this.shuffleArray([...this.allCards]);
            }
            this.currentItem = this.remainingItems.shift();
            return this.currentItem;
        }

        if (this.remainingItems.length === 0) {
            // Get items that haven't been answered correctly
            const remainingUnlearned = [];
            
            this.originalItems.forEach(kanji => {
                switch (this.mode) {
                    case PRACTICE_MODES.STANDARD:
                        if (!this.correctMeanings.has(kanji.id)) {
                            remainingUnlearned.push({
                                ...kanji,
                                type: "meaning",
                                questionType: "What is the meaning of this kanji?"
                            });
                        }
                        if (!this.correctReadings.has(kanji.id)) {
                            remainingUnlearned.push({
                                ...kanji,
                                type: "reading",
                                questionType: "What is the reading of this kanji?"
                            });
                        }
                        break;
                    case PRACTICE_MODES.ENGLISH_TO_KANJI:
                        if (!this.correctRecognition.has(kanji.id)) {
                            const primaryMeaning = kanji.meanings.find(m => m.primary)?.meaning;
                            remainingUnlearned.push({
                                ...kanji,
                                type: "recognition",
                                questionType: "Select the kanji that means",
                                meaningToMatch: primaryMeaning,
                                options: this.generateKanjiOptions(kanji)
                            });
                        }
                        break;
                    case PRACTICE_MODES.COMBINED:
                        if (!this.correctMeanings.has(kanji.id)) {
                            remainingUnlearned.push({
                                ...kanji,
                                type: "meaning",
                                questionType: "What is the meaning of this kanji?"
                            });
                        }
                        if (!this.correctReadings.has(kanji.id)) {
                            remainingUnlearned.push({
                                ...kanji,
                                type: "reading",
                                questionType: "What is the reading of this kanji?"
                            });
                        }
                        if (!this.correctRecognition.has(kanji.id)) {
                            const primaryMeaning = kanji.meanings.find(m => m.primary)?.meaning;
                            remainingUnlearned.push({
                                ...kanji,
                                type: "recognition",
                                questionType: "Select the kanji that means",
                                meaningToMatch: primaryMeaning,
                                options: this.generateKanjiOptions(kanji)
                            });
                        }
                        break;
                }
            });

            // Shuffle the remaining items
            if (remainingUnlearned.length > 0) {
                this.remainingItems = this.shuffleArray(remainingUnlearned);
            }
        }

        this.currentItem = this.remainingItems.shift();
        return this.currentItem;
    }

    checkAnswer(userAnswer) {
        if (!this.currentItem) return false;

        let isCorrect = false;

        switch (this.currentItem.type) {
            case "meaning":
                isCorrect = this.checkMeaningAnswer(userAnswer);
                if (isCorrect) {
                    this.correctMeanings.add(this.currentItem.id);
                    if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
                        this.currentStreak++;
                        this.updateHighScore();
                    }
                } else {
                    if (this.endlessMode === ENDLESS_MODES.HARDCORE) {
                        this.currentStreak = 0;
                    }
                }
                break;
                
            case "reading":
                isCorrect = this.checkReadingAnswer(userAnswer);
                if (isCorrect) {
                    this.correctReadings.add(this.currentItem.id);
                    if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
                        this.currentStreak++;
                        this.updateHighScore();
                    }
                } else {
                    if (this.endlessMode === ENDLESS_MODES.HARDCORE) {
                        this.currentStreak = 0;
                    }
                }
                break;
                
            case "recognition":
                isCorrect = parseInt(userAnswer) === this.currentItem.id;
                if (isCorrect) {
                    this.correctRecognition.add(this.currentItem.id);
                    if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
                        this.currentStreak++;
                        this.updateHighScore();
                    }
                } else {
                    if (this.endlessMode === ENDLESS_MODES.HARDCORE) {
                        this.currentStreak = 0;
                    }
                }
                break;
        }

        return isCorrect;
    }

    updateHighScore() {
        if (this.currentStreak > this.highScore) {
            this.highScore = this.currentStreak;
        }
    }

    checkMeaningAnswer(userAnswer) {
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        
        // Check primary meanings
        const isPrimaryCorrect = this.currentItem.meanings.some(m => 
            m.meaning.toLowerCase() === normalizedUserAnswer
        );
        
        if (isPrimaryCorrect) return true;
        
        // Check auxiliary meanings
        return this.currentItem.auxiliaryMeanings.some(m => 
            m.meaning.toLowerCase() === normalizedUserAnswer
        );
    }

    checkReadingAnswer(userAnswer) {
        const userReading = userAnswer.trim();
        return this.currentItem.readings.some(r => r.reading === userReading);
    }

    isComplete() {
        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            return false;
        }

        const progress = this.getProgress();
        return progress.current === progress.total;
    }

    getProgress() {
        const totalKanji = this.originalItems.length;
        let total, current;

        if (this.endlessMode !== ENDLESS_MODES.DISABLED) {
            return {
                total: Infinity,
                current: this.currentStreak,
                highScore: this.highScore,
                currentStreak: this.currentStreak,
                endlessMode: this.endlessMode
            };
        }

        switch (this.mode) {
            case PRACTICE_MODES.STANDARD:
                total = totalKanji * 2; // One point each for meaning and reading
                current = this.correctMeanings.size + this.correctReadings.size;
                return {
                    total,
                    current,
                    meaningProgress: this.correctMeanings.size,
                    readingProgress: this.correctReadings.size
                };

            case PRACTICE_MODES.ENGLISH_TO_KANJI:
                total = totalKanji; // One point for each recognition test
                current = this.correctRecognition.size;
                return {
                    total,
                    current,
                    recognitionProgress: this.correctRecognition.size
                };

            case PRACTICE_MODES.COMBINED:
                total = totalKanji * 3; // One point each for meaning, reading, and recognition
                current = this.correctMeanings.size + 
                         this.correctReadings.size + 
                         this.correctRecognition.size;
                return {
                    total,
                    current,
                    meaningProgress: this.correctMeanings.size,
                    readingProgress: this.correctReadings.size,
                    recognitionProgress: this.correctRecognition.size
                };

            default:
                return {
                    total: 0,
                    current: 0
                };
        }
    }
}

export default KanjiReviewSession;