import { styles, theme } from "../../../constants/index";
import { REVIEW_STATES } from "./types";
import { loadSvgContent } from "../../../handlers/practice/shared/index";

export class ReviewCard {
    constructor(item, state = REVIEW_STATES.ANSWERING) {
        this.item = item;
        this.state = state;
        this.$container = null;
        this.isKanji = !!this.item.readings; // Check if it's a kanji item
    }

    getQuestionText() {
        if (!this.isKanji) {
            return ["What is the meaning of this ", this.createEmphasisSpan("radical"), " ?"];
        }
    
        if (this.item.type === "reading") {
            const readingType = this.item.readings.find(r => r.primary)?.type;
            const readingText = readingType === "onyomi" ? "on'yomi" : "kun'yomi";
            return ["What is the ", this.createEmphasisSpan(readingText), " reading for this kanji?"];
        }
    
        return ["What is the ", this.createEmphasisSpan("meaning"), " of this kanji?"];
    }
    
    createEmphasisSpan(text) {
        return $("<span>")
            .text(text)
            .css({
                fontWeight: theme.typography.fontWeight.bold,
                color: this.isKanji ? theme.colors.kanji : theme.colors.radical,
                padding: `${theme.spacing.xs}`,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: this.isKanji ? 
                    "rgba(235, 1, 156, 0.1)" : 
                    "rgba(5, 152, 228, 0.1)"
            });
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

    processMnemonic(mnemonic) {
        if (!mnemonic) return "";

        if (!this.isKanji) {
            // Radical flow - only process radical tags
            return mnemonic.replace(/<radical>(.*?)<\/radical>/g, (_, content) => 
                `<span class="ep-mnemonic-radical" style="background-color: ${theme.colors.radical}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            );
        }

        // Kanji flow - process all tags
        return mnemonic
            .replace(/<radical>(.*?)<\/radical>/g, (_, content) => 
                `<span class="ep-mnemonic-radical" style="background-color: ${theme.colors.radical}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            )
            .replace(/<kanji>(.*?)<\/kanji>/g, (_, content) => 
                `<span class="ep-mnemonic-kanji" style="background-color: ${theme.colors.kanji}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            )
            .replace(/<reading>(.*?)<\/reading>/g, (_, content) => 
                `<span class="ep-mnemonic-reading" style="background-color: ${theme.colors.gray[200]}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.gray[800]}">${content}</span>`
            );
    }

    async renderAnsweringState() {
        const $content = $("<div>").addClass("ep-review-content");
    
        const $character = await this.renderCharacter();
        const $question = $("<div>")
            .addClass("ep-review-question")
            .css({
                fontSize: theme.typography.fontSize.lg,
                marginBottom: theme.spacing.lg,
                color: theme.colors.gray[700]
            });

        // Handle array of text and elements
        const questionContent = this.getQuestionText();
        if (Array.isArray(questionContent)) {
            questionContent.forEach(content => {
                if (content instanceof jQuery) {
                    $question.append(content);
                } else {
                    $question.append(document.createTextNode(content));
                }
            });
        } else {
            $question.text(questionContent);
        }

        const $inputSection = $("<div>")
            .addClass("ep-review-input-section")
            .css(styles.reviewModal.inputSection)
            .append(
                $("<input>")
                    .attr({
                        type: "text",
                        id: "ep-review-answer",
                        placeholder: this.item.type === "reading" ? "Enter reading..." : "Enter meaning...",
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

        return $content.append($character, $question, $inputSection);
    }

    async renderReviewingState() {
        const $content = $("<div>").addClass("ep-review-content");
        const $character = await this.renderCharacter();
        const $explanation = $("<div>")
            .addClass("ep-review-explanation")
            .css(styles.reviewModal.explanation);

        if (this.isKanji) {
            const sections = {
                current: this.item.type === "reading" ? "Reading" : "Meaning",
                other: this.item.type === "reading" ? "Meaning" : "Reading"
            };

            // Current section (expanded)
            $explanation.append(
                this.createExplanationSection(
                    sections.current,
                    this.item.type === "reading" 
                        ? this.item.readings.find(r => r.primary)?.reading
                        : this.item.meanings.find(m => m.primary)?.meaning,
                    this.item.type === "reading" ? this.item.readingMnemonic : this.item.meaningMnemonic,
                    true
                )
            );

            // Other section (collapsed)
            $explanation.append(
                this.createExplanationSection(
                    sections.other,
                    this.item.type === "reading" 
                        ? this.item.meanings.find(m => m.primary)?.meaning
                        : this.item.readings.find(r => r.primary)?.reading,
                    this.item.type === "reading" ? this.item.meaningMnemonic : this.item.readingMnemonic,
                    false
                )
            );
        }  else {
            // Radical explanation
            $explanation.append(
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
                        .css(styles.reviewModal.explanation.meaningText)
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
                            .html(this.processMnemonic(this.item.meaningMnemonic))
                            .css(styles.reviewModal.explanation.mnemonic)
                    )
            );
        }

        const $nextButton = $("<button>")
            .attr("id", "ep-review-continue")
            .text("Continue Review")
            .css({
                ...styles.reviewModal.buttons.submit,
                marginTop: theme.spacing.md,
                minWidth: "120px"
            });

        return $content.append($character, $explanation, $nextButton);
    }

    createExplanationSection(title, answer, mnemonic, isExpanded) {
        const $section = $("<div>")
            .addClass("explanation-section")
            .css({
                marginBottom: theme.spacing.md,
                borderBottom: isExpanded ? "none" : `1px solid ${theme.colors.gray[200]}`,
                paddingBottom: theme.spacing.md
            });

        const getHeaderText = () => {
            if (isExpanded) {
                return `${title}: ${answer}`;
            } else {
                return `View ${title}`;
            }
        }

        const $header = $("<div>")
            .css({
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: theme.spacing.sm
            })
            .append(
                $("<span>")
                    .text(isExpanded ? "▼" : "▶")
                    .css({ 
                        color: theme.colors.gray[500],
                        marginRight: theme.spacing.xs
                    }),
                $("<h3>")
                    .text(getHeaderText())
                    .css({
                        margin: 0,
                        flex: 1,
                        color: theme.colors.gray[800]
                    })
            );

        const $content = $("<div>")
            .css({
                display: isExpanded ? "block" : "none",
                paddingTop: theme.spacing.sm
            })
            .append(
                $("<div>")
                    .addClass("ep-mnemonic-container")
                    .css(styles.reviewModal.explanation.mnemonicContainer)
                    .append(
                        $("<span>")
                            .text("Mnemonic:")
                            .css(styles.reviewModal.explanation.mnemonicLabel),
                        $("<div>")
                            .addClass("ep-review-mnemonic")
                            .html(this.processMnemonic(mnemonic))
                            .css(styles.reviewModal.explanation.mnemonic)
                    )
            );

            $header.on("click", function() {
                $content.slideToggle(200);
                const $arrow = $(this).find("span");
                const $headerText = $(this).find("h3");
                
                if ($content.is(":visible")) {
                    $arrow.text("▼");
                    $headerText.text(`${title}: ${answer}`);
                } else {
                    $arrow.text("▶");
                    $headerText.text(`View ${title}`);
                }
            });

        return $section.append($header, $content);
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