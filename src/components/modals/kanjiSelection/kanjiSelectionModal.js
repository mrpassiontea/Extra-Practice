import { modalTemplate, styles, theme, PRACTICE_MODES } from "../../../constants/index";
import { MODAL_STATES, EVENTS } from "./types";
import KanjiGrid from "./kanjiGrid";

class KanjiSelectionModal {
    constructor(kanji, allUnlockedKanji) {
        this.kanji = kanji;
        this.allUnlockedKanji = allUnlockedKanji;
        this.selectedMode = PRACTICE_MODES.STANDARD;
        this.state = MODAL_STATES.READY;
        this.totalKanji = kanji.length;
        this.$modal = null;
        this.kanjiGrid = null;
        this.callbacks = new Map();
    }

    on(event, callback) {
        this.callbacks.set(event, callback);
        return this;
    }

    emit(event, data) {
        const callback = this.callbacks.get(event);
        if (callback) callback(data);
    }

    validateSelection(selectedCount) {
        const minRequired = {
            [PRACTICE_MODES.STANDARD]: 1,
            [PRACTICE_MODES.ENGLISH_TO_KANJI]: 4,
            [PRACTICE_MODES.COMBINED]: 4
        };

        const required = minRequired[this.selectedMode];
        const isValid = selectedCount >= required;
        const startButton = $("#ep-practice-modal-start");

        if (isValid) {
            startButton
                .prop("disabled", false)
                .text(`Start Review (${selectedCount} Selected)`)
                .css({
                    ...styles.practiceModal.buttons.start.base,
                    ...styles.practiceModal.buttons.start.kanji,
                    opacity: 1,
                    cursor: "pointer"
                });
        } else {
            startButton
                .prop("disabled", true)
                .text(`Select at least ${required} kanji`)
                .css({
                    ...styles.practiceModal.buttons.start.base,
                    ...styles.practiceModal.buttons.start.kanji,
                    opacity: 0.5,
                    cursor: "not-allowed"
                });
        }
    }

    updateSelectAllButton(selectedCount) {
        const selectAllButton = $("#ep-practice-modal-select-all");
        const isAllSelected = selectedCount === this.totalKanji;
        
        selectAllButton
            .text(isAllSelected ? "Deselect All" : "Select All")
            .css({
                color: isAllSelected ? theme.colors.error : theme.colors.white,
                borderColor: isAllSelected ? theme.colors.error : theme.colors.white,
                '&:hover': {
                    borderColor: isAllSelected ? theme.colors.error : theme.colors.kanji
                }
            });
    }

    handleSelectionChange(selectedKanji) {
        const selectedCount = selectedKanji.size;
        this.updateSelectAllButton(selectedCount);
        this.validateSelection(selectedCount);
    }

    createModeSelector() {
        const $container = $("<div>")
            .css(styles.practiceModal.modeSelector.container);

        const $label = $("<div>")
            .text("Select Practice Mode")
            .css(styles.practiceModal.modeSelector.label);

        const $options = $("<div>")
            .css(styles.practiceModal.modeSelector.options);

        const createOption = (mode, label) => {
            const $option = $("<button>")
                .text(label)
                .css({
                    ...styles.practiceModal.modeSelector.option.base,
                    ...(this.selectedMode === mode ? styles.practiceModal.modeSelector.option.selected : {})
                })
                .on("click", () => {
                    $options.find("button").css(styles.practiceModal.modeSelector.option.base);
                    $option.css({
                        ...styles.practiceModal.modeSelector.option.base,
                        ...styles.practiceModal.modeSelector.option.selected
                    });
                    
                    this.selectedMode = mode;
                    const currentSelection = this.kanjiGrid.getSelectedKanji();
                    this.validateSelection(currentSelection.length);
                });
            return $option;
        };

        $options.append(
            createOption(PRACTICE_MODES.STANDARD, "Standard Practice"),
            createOption(PRACTICE_MODES.ENGLISH_TO_KANJI, "English → Kanji"),
            createOption(PRACTICE_MODES.COMBINED, "Combined Practice")
        );

        return $container.append($label, $options);
    }

    async render() {
        this.$modal = $(modalTemplate).appendTo("body");
        
        $("#username").text($("p.user-summary__username:first").text());
        
        this.$modal.css(styles.practiceModal.backdrop);
        $("#ep-practice-modal-welcome").css(styles.practiceModal.welcomeText.container);
        $("#ep-practice-modal-welcome h1").css(styles.practiceModal.welcomeText.username);
        $("#ep-practice-modal-welcome h2")
            .text("Please select the Kanji characters you would like to practice")
            .css({
                color: theme.colors.white,
                opacity: 0.9
            });

        const $modeSelector = this.createModeSelector();
        $modeSelector.insertAfter("#ep-practice-modal-welcome");

        $("#ep-practice-modal-footer").css(styles.practiceModal.footer);
        $("#ep-practice-modal-content").css(styles.practiceModal.contentWrapper);
        
        // Initial disabled state with kanji color scheme
        $("#ep-practice-modal-start").css({
            ...styles.practiceModal.buttons.start.base,
            ...styles.practiceModal.buttons.start.kanji,
            opacity: 0.5,
            cursor: "not-allowed"
        });

        $("#ep-practice-modal-select-all").css({
            ...styles.practiceModal.buttons.selectAll,
            '&:hover': {
                borderColor: theme.colors.kanji
            }
        });

        $("#ep-practice-modal-close").css({
            ...styles.practiceModal.buttons.exit,
            '&:hover': {
                borderColor: theme.colors.kanji,
                color: theme.colors.kanji
            }
        });

        this.kanjiGrid = new KanjiGrid(
            this.kanji,
            this.handleSelectionChange.bind(this)
        );

        const $grid = await this.kanjiGrid.render();
        $("#ep-practice-modal-grid").replaceWith($grid);

        $("#ep-practice-modal-select-all").on("click", () => {
            const isSelectingAll = $("#ep-practice-modal-select-all").text() === "Select All";
            this.kanjiGrid.toggleAllKanji(isSelectingAll);
        });

        $("#ep-practice-modal-close").on("click", () => {
            this.emit(EVENTS.CLOSE);
        });

        $("#ep-practice-modal-start").on("click", () => {
            const selectedKanji = this.kanjiGrid.getSelectedKanji();
            const minRequired = {
                [PRACTICE_MODES.STANDARD]: 1,
                [PRACTICE_MODES.ENGLISH_TO_KANJI]: 4,
                [PRACTICE_MODES.COMBINED]: 4
            };

            if (selectedKanji.length >= minRequired[this.selectedMode]) {
                this.emit(EVENTS.START_REVIEW, {
                    kanji: selectedKanji,
                    mode: this.selectedMode,
                    allUnlockedKanji: this.allUnlockedKanji
                });
            }
        });

        return this.$modal;
    }

    remove() {
        if (this.$modal) {
            this.$modal.remove();
            this.$modal = null;
        }
    }
}

export default KanjiSelectionModal;