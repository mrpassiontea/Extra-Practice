import { modalTemplate, styles, theme } from "../../../constants/index";
import { MODAL_STATES, EVENTS } from "./types";
import KanjiGrid from "./kanjiGrid";

class KanjiSelectionModal {
    constructor(kanji) {
        this.kanji = kanji;
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

    updateStartButton(selectedCount) {
        const startButton = $("#ep-practice-modal-start");
        const baseStyles = {
            ...styles.practiceModal.buttons.start.base,
            backgroundColor: theme.colors.kanji,
            '&:hover': {
                backgroundColor: theme.colors.kanji,
                opacity: 0.9
            }
        };
        
        if (selectedCount > 0) {
            startButton
                .prop("disabled", false)
                .text(`Start Review (${selectedCount} Selected)`)
                .css({
                    ...baseStyles,
                    opacity: "1",
                    pointerEvents: "inherit"
                });
        } else {
            startButton
                .prop("disabled", true)
                .text("Start Review (0 Selected)")
                .css({
                    ...baseStyles,
                    ...styles.practiceModal.buttons.start.disabled
                });
        }
    }

    handleSelectionChange(selectedKanji) {
        const selectedCount = selectedKanji.size;
        this.updateSelectAllButton(selectedCount);
        this.updateStartButton(selectedCount);
    }

    async render() {
        this.$modal = $(modalTemplate).appendTo("body");
        
        $("#username").text($("p.user-summary__username:first").text());
        
        // Apply themed styles
        this.$modal.css(styles.practiceModal.backdrop);
        $("#ep-practice-modal-welcome").css({
            ...styles.practiceModal.welcomeText.container,
            '& h2': {
                color: theme.colors.kanji
            }
        });
        
        $("#ep-practice-modal-welcome h1").css(styles.practiceModal.welcomeText.username);
        $("#ep-practice-modal-welcome h2")
            .text("Please select the Kanji characters you would like to practice")
            .css({
                color: theme.colors.white,
                opacity: 0.9
            });

        $("#ep-practice-modal-footer").css(styles.practiceModal.footer);
        $("#ep-practice-modal-content").css(styles.practiceModal.contentWrapper);
        
        // Apply kanji-specific button styles
        $("#ep-practice-modal-start").css({
            ...styles.practiceModal.buttons.start.base,
            backgroundColor: theme.colors.kanji,
            '&:hover': {
                backgroundColor: theme.colors.kanji,
                opacity: 0.9
            }
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

        this.updateStartButton(0);

        // Event handlers
        $("#ep-practice-modal-select-all").on("click", () => {
            const isSelectingAll = $("#ep-practice-modal-select-all").text() === "Select All";
            this.kanjiGrid.toggleAllKanji(isSelectingAll);
        });

        $("#ep-practice-modal-close").on("click", () => {
            this.emit(EVENTS.CLOSE);
        });

        $("#ep-practice-modal-start").on("click", () => {
            const selectedKanji = this.kanjiGrid.getSelectedKanji();
            if (selectedKanji.length > 0) {
                this.emit(EVENTS.START_REVIEW, selectedKanji);
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