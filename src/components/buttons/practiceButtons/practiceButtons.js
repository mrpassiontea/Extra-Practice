import { styles, SELECTORS } from "../../../constants/index";
import { PRACTICE_TYPES } from "./types";
import { handleRadicalPractice, handleKanjiPractice } from "../../../handlers/practice/index";

class PracticeButton {
    constructor(type) {
        this.type = type;
        this.buttonStyle = this.getButtonStyle();
        this.handleClick = this.handleClick.bind(this);
    }

    getButtonStyle() {
        return this.type === PRACTICE_TYPES.RADICAL
            ? styles.buttons.practice.radical
            : styles.buttons.practice.kanji;
    }

    async handleClick() {
        try {
            if (this.type === PRACTICE_TYPES.RADICAL) {
                await handleRadicalPractice();
            } else {
                await handleKanjiPractice();
            }
        } catch (error) {
            console.error(`Error handling ${this.type} practice:`, error);
        }
    }

    render() {
        const $button = $("<button>")
            .attr("id", `ep-${this.type}-btn`)
            .text("Practice")
            .css(this.buttonStyle)
            .on("click", this.handleClick);

        const selector = `${SELECTORS.DIV_LEVEL_PROGRESS_CONTENT} ${SELECTORS.DIV_CONTENT_WRAPPER} ${SELECTORS.DIV_CONTENT_TITLE}`;
        
        // Doing a conditional check to add the practice button to the correct DIV.
        const targetSelector = this.type === PRACTICE_TYPES.RADICAL
            ? `${selector}:first`
            : `${selector}:last`;

        $button.appendTo(targetSelector);

        return $button;
    }
}

export default PracticeButton;