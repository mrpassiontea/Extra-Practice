import { modalTemplate, styles, theme, ENDLESS_MODES } from "../../../constants/index";
import { MODAL_STATES, EVENTS } from "./types";
import RadicalGrid from "./radicalGrid";
import { EndlessToggle } from "../../buttons/endlessToggle";

class RadicalSelectionModal {
    constructor(radicals) {
        this.radicals = radicals;
        this.state = MODAL_STATES.READY;
        this.endlessMode = ENDLESS_MODES.DISABLED;
        this.totalRadicals = radicals.length;
        this.$modal = null;
        this.radicalGrid = null;
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
        const isAllSelected = selectedCount === this.totalRadicals;
        
        selectAllButton
            .text(isAllSelected ? "Deselect All" : "Select All")
            .css({
                color: isAllSelected ? theme.colors.error : theme.colors.white,
                borderColor: isAllSelected ? theme.colors.error : theme.colors.white
            });
    }

    updateStartButton(selectedCount) {
        const startButton = $("#ep-practice-modal-start");
        
        if (selectedCount > 0) {
            startButton
                .prop("disabled", false)
                .text(`Start Review (${selectedCount} Selected)`)
                .css({
                    ...styles.practiceModal.buttons.start.base,
                    ...styles.practiceModal.buttons.start.radical
                });
        } else {
            startButton
                .prop("disabled", true)
                .text("Start Review (0 Selected)")
                .css({
                    ...styles.practiceModal.buttons.start.base,
                    ...styles.practiceModal.buttons.start.radical,
                    ...styles.practiceModal.buttons.start.disabled
                });
        }
    }

    handleSelectionChange(selectedRadicals) {
        const selectedCount = selectedRadicals.size;
        this.updateSelectAllButton(selectedCount);
        this.updateStartButton(selectedCount);
    }

    createEndlessModeSelector() {
        const endlessToggle = new EndlessToggle(false, (endlessMode) => {
            this.endlessMode = endlessMode;
        });
        return endlessToggle.createToggleSwitch();
    }

    async render() {
        this.$modal = $(modalTemplate).appendTo("body");
        
        $("#username").text($("p.user-summary__username:first").text());
        
        this.$modal.css(styles.practiceModal.backdrop);
        $("#ep-practice-modal-welcome").css(styles.practiceModal.welcomeText.container);
        $("#ep-practice-modal-welcome h1").css(styles.practiceModal.welcomeText.username);
        $("#ep-practice-modal-footer").css(styles.practiceModal.footer);
        $("#ep-practice-modal-start").css({
            ...styles.practiceModal.buttons.start.base,
            ...styles.practiceModal.buttons.start.radical,
            ...styles.practiceModal.buttons.start.disabled
        });
        $("#ep-practice-modal-select-all").css(styles.practiceModal.buttons.selectAll);
        $("#ep-practice-modal-content").css(styles.practiceModal.contentWrapper);
        $("#ep-practice-modal-close").css(styles.practiceModal.buttons.exit);

        const $endlessToggle = this.createEndlessModeSelector();
        $endlessToggle.insertAfter("#ep-practice-modal-welcome");
    
        this.radicalGrid = new RadicalGrid(
            this.radicals,
            this.handleSelectionChange.bind(this)
        );

        const $grid = await this.radicalGrid.render();
        $("#ep-practice-modal-grid").replaceWith($grid);

        this.updateStartButton(0);

        $("#ep-practice-modal-select-all").on("click", () => {
            const isSelectingAll = $("#ep-practice-modal-select-all").text() === "Select All";
            this.radicalGrid.toggleAllRadicals(isSelectingAll);
        });

        $("#ep-practice-modal-close").on("click", () => {
            this.emit(EVENTS.CLOSE);
        });

        $("#ep-practice-modal-start").on("click", () => {
            const selectedRadicals = this.radicalGrid.getSelectedRadicals();
            if (selectedRadicals.length > 0) {
                this.emit(EVENTS.START_REVIEW, {
                    items: selectedRadicals,
                    endlessMode: this.endlessMode
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

export default RadicalSelectionModal;