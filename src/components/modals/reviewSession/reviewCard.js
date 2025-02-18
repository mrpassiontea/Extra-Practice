import { styles, theme } from "../../../constants/index";
import { REVIEW_STATES } from "./types";
import { loadSvgContent } from "../../../handlers/practice/shared/index";

export class ReviewCard {
    constructor(item, state = REVIEW_STATES.ANSWERING) {
        this.item = item;
        this.state = state;
        this.$container = null;
        this.isKanji = !!this.item.readings;
        this.selectedOption = null;
        this.handleKanjiSelection = this.handleKanjiSelection.bind(this);
    }

    handleKanjiSelection(event, option) {
        const $selectedElement = $(event.currentTarget);
        
        this.$container.find('.kanji-option').css(styles.reviewModal.kanjiOption.base);
        
        $selectedElement.css({
            ...styles.reviewModal.kanjiOption.base,
            ...styles.reviewModal.kanjiOption.selected
        });
    
        this.selectedOption = option.id;
        
        const $submitButton = this.$container.find('#ep-review-submit');
        $submitButton
            .prop('disabled', false)
            .css({
                ...styles.reviewModal.buttons.submit,
                opacity: 1,
                cursor: "pointer"
            });
    }


    getQuestionText() {
        if (this.item.type === "recognition") {
            return ["Select the kanji that means ", this.createEmphasisSpan(this.item.meaningToMatch)];
        }
        
        if (!this.isKanji) {
            return ["What is the meaning of this ", this.createEmphasisSpan("radical"), "?"];
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

    createKanjiOption(option) {
        const $option = $("<div>")
            .addClass("kanji-option")
            .css(styles.reviewModal.kanjiOption.base)
            .data("kanji-id", option.id)
            .append(
                $("<div>")
                    .addClass("kanji-character")
                    .css({
                        fontSize: theme.typography.fontSize["2xl"],
                        color: theme.colors.gray[800],
                        textAlign: "center"
                    })
                    .text(option.character)
            );

        $option.on("click", (event) => this.handleKanjiSelection(event, option));
        
        return $option;
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
    
        if (this.item.type === "recognition") {
            return this.renderRecognitionCard($content);
        } else {
            const $character = await this.renderCharacter();
            const $question = $("<div>")
                .addClass("ep-review-question")
                .css({
                    fontSize: theme.typography.fontSize.lg,
                    marginBottom: theme.spacing.lg,
                    color: theme.colors.gray[700]
                });
    
            const questionContent = this.getQuestionText();
            questionContent.forEach(content => {
                if (content instanceof jQuery) {
                    $question.append(content);
                } else {
                    $question.append(document.createTextNode(content));
                }
            });
    
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
    
            $content.append($character);
            $content.append($question);
            $content.append($inputSection);
            
            return $content;
        }
    }

    async renderStandardAnsweringCard($content) {
        const $character = await this.renderCharacter();
        const $question = $("<div>")
            .addClass("ep-review-question")
            .css({
                fontSize: theme.typography.fontSize.lg,
                marginBottom: theme.spacing.lg,
                color: theme.colors.gray[700]
            });

        const questionContent = this.getQuestionText();
        questionContent.forEach(content => {
            if (content instanceof jQuery) {
                $question.append(content);
            } else {
                $question.append(document.createTextNode(content));
            }
        });

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

    async renderRecognitionCard($content) {
        const $questionContainer = $("<div>")
            .css({
                textAlign: "center",
                marginBottom: theme.spacing.xl
            });

        const $question = $("<div>")
            .addClass("ep-review-question")
            .css({
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.gray[700],
                marginBottom: theme.spacing.md
            });

        const questionContent = this.getQuestionText();
        questionContent.forEach(content => {
            if (content instanceof jQuery) {
                $question.append(content);
            } else {
                $question.append(document.createTextNode(content));
            }
        });

        $questionContainer.append($question);

        const $optionsGrid = $("<div>")
            .css({
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: theme.spacing.lg,
                padding: theme.spacing.xl,
                maxWidth: "500px",
                margin: "0 auto"
            });

        this.item.options.forEach(option => {
            $optionsGrid.append(this.createKanjiOption(option));
        });

        const $submitButton = $("<button>")
            .attr({
                id: "ep-review-submit",
                disabled: true
            })
            .text("Submit")
            .css({
                ...styles.reviewModal.buttons.submit,
                opacity: 0.5,
                cursor: "not-allowed"
            });

        const $submitButtonContainer = $("<div>")
            .css({
                textAlign: "center",
                marginTop: theme.spacing.xl
            })
            .append($submitButton);

        return $content.append($questionContainer, $optionsGrid, $submitButtonContainer);
    }

    processMnemonic(mnemonic) {
        if (!mnemonic) return "";

        if (!this.isKanji) {
            return mnemonic.replace(/<radical>(.*?)<\/radical>/g, (_, content) => 
                `<span style="background-color: ${theme.colors.radical}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            );
        }

        return mnemonic
            .replace(/<radical>(.*?)<\/radical>/g, (_, content) => 
                `<span style="background-color: ${theme.colors.radical}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            )
            .replace(/<kanji>(.*?)<\/kanji>/g, (_, content) => 
                `<span style="background-color: ${theme.colors.kanji}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.white}">${content}</span>`
            )
            .replace(/<reading>(.*?)<\/reading>/g, (_, content) => 
                `<span style="background-color: ${theme.colors.gray[200]}; padding: 0 ${theme.spacing.xs}; border-radius: ${theme.borderRadius.sm}; color: ${theme.colors.gray[800]}">${content}</span>`
            );
    }

    async renderReviewingState() {
        const $content = $("<div>").addClass("ep-review-content");
        const $character = await this.renderCharacter();
        const $explanation = $("<div>")
            .addClass("ep-review-explanation")
            .css(styles.reviewModal.explanation);

        const primaryReading = this.item.readings?.find(r => r.primary);
        const primaryMeaning = this.item.meanings?.find(m => m.primary);

        const $continueButton = $("<button>")
        .attr("id", "ep-review-continue")
        .text("Continue Review")
        .css({
            ...styles.reviewModal.buttons.submit,
            minWidth: "120px",
            display: "block",
            margin: "30px auto 0"
        });
        
        const $buttonContainer = $("<div>")
            .addClass("ep-review-buttons")
            .css({ 
                display: "flex",
                gap: theme.spacing.md,
                justifyContent: "center",
                marginTop: theme.spacing.xl
            })
            .append($continueButton);

        // Handle non-kanji (radical) review state
        if (!this.isKanji) {
            $content.append(
                $character,
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
                )
            );

            $content.append($buttonContainer);
            return $content;
        }

        // Handle kanji review states based on question type
        switch (this.item.type) {
            case "recognition":
                $explanation.append(
                    this.createExplanationSection(
                        "Meaning",
                        this.item.meaningToMatch,
                        this.item.meaningMnemonic,
                        true
                    )
                );

                if (primaryReading) {
                    const readingType = primaryReading.type === "onyomi" ? "On'yomi" : "Kun'yomi";
                    $explanation.append(
                        this.createExplanationSection(
                            "Reading",
                            `${readingType}: ${primaryReading.reading}`,
                            this.item.readingMnemonic,
                            false
                        )
                    );
                }
                break;

            case "reading":
                if (primaryReading) {
                    const readingType = primaryReading.type === "onyomi" ? "On'yomi" : "Kun'yomi";
                    $explanation.append(
                        this.createExplanationSection(
                            "Reading",
                            `${readingType}: ${primaryReading.reading}`,
                            this.item.readingMnemonic,
                            true
                        )
                    );
                }

                if (primaryMeaning) {
                    $explanation.append(
                        this.createExplanationSection(
                            "Meaning",
                            primaryMeaning.meaning,
                            this.item.meaningMnemonic,
                            false
                        )
                    );
                }
                break;

            case "meaning":
                if (primaryMeaning) {
                    $explanation.append(
                        this.createExplanationSection(
                            "Meaning",
                            primaryMeaning.meaning,
                            this.item.meaningMnemonic,
                            true
                        )
                    );
                }

                if (primaryReading) {
                    const readingType = primaryReading.type === "onyomi" ? "On'yomi" : "Kun'yomi";
                    $explanation.append(
                        this.createExplanationSection(
                            "Reading",
                            `${readingType}: ${primaryReading.reading}`,
                            this.item.readingMnemonic,
                            false
                        )
                    );
                }
                break;
        }

        

        $content.append($character, $explanation);
        $content.append($buttonContainer);

        return $content;
    }

    createExplanationSection(title, answer, mnemonic, isExpanded) {
        const $section = $("<div>")
            .addClass("explanation-section")
            .css({
                marginBottom: theme.spacing.md,
                width: "100%",
                display: "block"
            });
    
        const $header = $("<div>")
            .css({
                display: "block",
                padding: `${theme.spacing.sm} 0`,
                width: "100%",
                borderBottom: `1px solid ${theme.colors.gray[200]}`,
            });
            

        const $headerContent = $("<div>")
            .css({
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                width: "100%"
            }).append(
                $("<span>")
                    .text(isExpanded ? "▼" : "▶")
                    .css({ 
                        color: theme.colors.gray[600],
                        marginRight: theme.spacing.sm,
                        fontSize: theme.typography.fontSize.md,
                        flexShink: 0
                    }),
                $("<h3>")
                    .text(title)
                    .css({
                        margin: 0,
                        color: theme.colors.gray[800],
                        fontWeight: theme.typography.fontWeight.medium,
                        fontSize: theme.typography.fontSize.md,
                        flex: 1
                    })
            );
        
        $header.append($headerContent);
    
        const $content = $("<div>")
            .css({
                display: isExpanded ? "block" : "none",
                paddingLeft: theme.spacing.xl,
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.md
            });
    
        if (title.toLowerCase() === "reading") {
            // Extract reading type and format display
            const readingType = this.item.readings.find(r => r.primary)?.type;
            const formattedType = readingType === "onyomi" ? "On'yomi" : "Kun'yomi";
            
            $content.append(
                $("<div>")
                    .css({
                        fontSize: theme.typography.fontSize.lg,
                        color: theme.colors.gray[800],
                        marginBottom: theme.spacing.md
                    })
                    .append(
                        $("<span>")
                            .text(`${formattedType}: `)
                            .css({
                                color: theme.colors.gray[600],
                                fontSize: theme.typography.fontSize.md
                            }),
                        $("<span>")
                            .text(this.item.readings.find(r => r.primary)?.reading || "")
                    )
            );
    
            if (mnemonic) {
                $content.append(
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
            }
        } else {
            const meaningText = this.item.type === "recognition" 
                ? this.item.meaningToMatch
                : this.item.meanings.find(m => m.primary)?.meaning;
    
            $content.append(
                $("<div>")
                    .css({
                        fontSize: theme.typography.fontSize.lg,
                        color: theme.colors.gray[800],
                        marginBottom: theme.spacing.md
                    })
                    .text(meaningText)
            );
    
            if (mnemonic) {
                $content.append(
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
            }
        }
    
        $header.on("click", function() {
            const $content = $(this).siblings("div");
            const isVisible = $content.is(":visible");
            $content.slideToggle(200);
            const $arrow = $(this).find("span").first();
            $arrow.text(isVisible ? "▶" : "▼");
        });
    
        return $section.append($header, $content);
    }

    async render() {
        this.$container = $("<div>")
            .addClass("ep-review-card")
            .css({
                padding: theme.spacing.xl,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: theme.spacing.xl
            });
    
        const $characterContainer = $("<div>")
            .css({
                textAlign: "center",
                width: "100%"
            });
    
        const $contentContainer = $("<div>")
            .css({
                width: "100%",
                textAlign: "left"
            });
    
        const content = await (this.state === REVIEW_STATES.ANSWERING
            ? this.renderAnsweringState()
            : this.renderReviewingState());
    
        if (this.state === REVIEW_STATES.ANSWERING) {
            const $character = content.find(".ep-review-character").detach();
            $characterContainer.append($character);
            
            $contentContainer.append(content);
        } else {
            const $character = content.find(".ep-review-character").detach();
            $characterContainer.append($character);
            
            $contentContainer.append(content.find(".ep-review-explanation"));
        }
    
        this.$container.append($characterContainer, $contentContainer);
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

    getAnswer() {
        if (this.item.type === "recognition") {
            return this.selectedOption?.toString() || "";
        }
        return $("#ep-review-answer").val()?.trim() || "";
    }

    remove() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }
}

export default ReviewCard;