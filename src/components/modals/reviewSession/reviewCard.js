import { styles, theme } from "../../../constants/index";
import { REVIEW_STATES } from "./types";
import { loadSvgContent } from "../../../handlers/practice/shared/index";

export class ReviewCard {
    constructor(item, state = REVIEW_STATES.ANSWERING) {
        this.item = item;
        this.state = state;
        this.$container = null;
    }

    async renderCharacter() {
        const $character = $("<div>")
            .addClass("ep-review-character")
            .css(styles.reviewModal.character);

        if (this.item.character) {
            $character.text(this.item.character);
        } else if (this.item.svg) {
            try {
                const svgContent = await loadSvgContent(this.item.svg);
                $character.html(svgContent);
                const svg = $character.find("svg")[0];
                if (svg) {
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "100%");
                }
            } catch (error) {
                console.error("Error loading SVG:", error);
                $character.text(this.item.meaning);
            }
        }

        return $character;
    }

    async renderAnsweringState() {
        const $content = $("<div>").addClass("ep-review-content");
        
        const $character = await this.renderCharacter();
        const $inputSection = $("<div>")
            .addClass("ep-review-input-section")
            .css(styles.reviewModal.inputSection)
            .append(
                $("<input>")
                    .attr({
                        type: "text",
                        id: "ep-review-answer",
                        placeholder: "Enter meaning...",
                        tabindex: "1",
                        autofocus: true
                    })
                    .css(styles.reviewModal.input),
                $("<button>")
                    .attr("id", "ep-review-submit")
                    .text("Submit")
                    .attr("tabindex", "2")
                    .css(styles.reviewModal.buttons.submit)
            );

        return $content.append($character, $inputSection);
    }

    async renderReviewingState() {
        const $content = $("<div>").addClass("ep-review-content");
        
        const $character = await this.renderCharacter();
        const $explanation = $("<div>")
            .addClass("ep-review-explanation")
            .css(styles.reviewModal.explanation)
            .append(
                $("<h3>").append(
                    $("<span>")
                        .text("Meaning: ")
                        .css(styles.reviewModal.explanation.meaningLabel),
                    $("<a>")
                        .attr({
                            href: this.item.documentationUrl,
                            target: "_blank",
                            title: `Click to learn more about: ${this.item.meaning}`
                        })
                        .text(this.item.meaning)
                        .css({
                            ...styles.reviewModal.explanation.meaningText,
                        })
                ),
                $("<div>")
                    .addClass("ep-mnemonic-container")
                    .css(styles.reviewModal.explanation.mnemonicContainer)
                    .append(
                        $("<span>")
                            .text("Mnemonic:")
                            .css(styles.reviewModal.explanation.mnemonicLabel),
                        $("<div>")
                            .addClass("ep-review-mnemonic")
                            .html(this.processRadicalMnemonic(this.item.meaningMnemonic))
                            .css(styles.reviewModal.explanation.mnemonic)
                    )
            );

        const $nextButton = $("<button>")
            .attr("id", "ep-review-continue")
            .text("Continue Review")
            .css({
                ...styles.reviewModal.buttons.submit,
                marginTop: "1rem",
                minWidth: "120px"
            });

        return $content.append($character, $explanation, $nextButton);
    }

    processRadicalMnemonic(mnemonic) {
        return mnemonic.replace(
            /<radical>(.*?)<\/radical>/g,
            (_, content) => `<span class="ep-mnemonic-highlight" style="background-color: ${theme.colors.gray[200]}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.gray[800]}">${content}</span>`
        );
    }

    async render() {
        this.$container = $("<div>")
            .addClass("ep-review-card")
            .css(styles.reviewModal.content);

        const content = this.state === REVIEW_STATES.ANSWERING
            ? await this.renderAnsweringState()
            : await this.renderReviewingState();

        this.$container.append(content);
        return this.$container;
    }

    async updateState(newState) {
        if (this.state === newState) return;
        
        this.state = newState;
        const content = this.state === REVIEW_STATES.ANSWERING
            ? await this.renderAnsweringState()
            : await this.renderReviewingState();

        this.$container.empty().append(content);
    }

    remove() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }
}

export default ReviewCard;