import { styles, theme } from "../../../constants/index";

class KanjiGrid {
    constructor(kanji, onSelectionChange) {
        this.kanji = kanji;
        this.selectedKanji = new Set();
        this.onSelectionChange = onSelectionChange;
        this.$container = null;
    }

    updateKanjiSelection($element, kanji, isSelected) {
        const baseStyles = {
            ...styles.practiceModal.radical.base,
            border: `2px solid ${isSelected ? theme.colors.kanji : 'rgba(255, 255, 255, 0.2)'}`,
            background: isSelected ? 'rgba(235, 1, 156, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: theme.colors.kanji,
                background: isSelected ? 'rgba(235, 1, 156, 0.3)' : 'rgba(255, 255, 255, 0.2)'
            }
        };

        $element.css(baseStyles);

        if (isSelected) {
            this.selectedKanji.add(kanji.id);
        } else {
            this.selectedKanji.delete(kanji.id);
        }

        this.onSelectionChange(this.selectedKanji);
    }

    toggleAllKanji(shouldSelect) {
        if (shouldSelect) {
            this.kanji.forEach(kanji => this.selectedKanji.add(kanji.id));
        } else {
            this.selectedKanji.clear();
        }

        this.$container.find(".kanji-selection-item").each((_, element) => {
            const $element = $(element);
            const kanjiId = parseInt($element.data("kanji-id"));
            this.updateKanjiSelection(
                $element,
                this.kanji.find(k => k.id === kanjiId),
                shouldSelect
            );
        });

        this.onSelectionChange(this.selectedKanji);
    }

    getSelectedKanji() {
        return Array.from(this.selectedKanji).map(id => 
            this.kanji.find(kanji => kanji.id === id)
        );
    }

    createKanjiPreview(kanji) {
        return $("<div>")
            .addClass("kanji-preview")
            .css({
                display: "none",
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: theme.colors.gray[800],
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                zIndex: theme.zIndex.modal + 1,
                minWidth: "200px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                color: theme.colors.white
            })
            .append(
                $("<div>")
                    .addClass("kanji-meanings")
                    .css({
                        marginBottom: theme.spacing.sm,
                        fontWeight: theme.typography.fontWeight.bold
                    })
                    .text(kanji.meanings.map(m => m.meaning).join(", ")),
                $("<div>")
                    .addClass("kanji-readings")
                    .css({
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.gray[300]
                    })
                    .text(kanji.readings.map(r => r.reading).join(", ")),
                $("<div>")
                    .addClass("kanji-radicals")
                    .css({
                        marginTop: theme.spacing.sm,
                        borderTop: `1px solid ${theme.colors.gray[600]}`,
                        paddingTop: theme.spacing.sm,
                        fontSize: theme.typography.fontSize.xs
                    })
                    .append(
                        $("<span>")
                            .text("Radicals: ")
                            .css({ color: theme.colors.gray[400] }),
                        $("<span>")
                            .text(kanji.radicals.map(r => r.meaning).join(", "))
                    )
            );
    }

    createKanjiElement(kanji) {
        const $element = $("<div>")
            .addClass("kanji-selection-item")
            .css({
                ...styles.practiceModal.radical.base,
                position: "relative"
            })
            .data("kanji-id", kanji.id)
            .append(
                $("<div>")
                    .addClass("kanji-character")
                    .css({
                        fontSize: theme.typography.fontSize.xl,
                        color: theme.colors.white
                    })
                    .text(kanji.character)
            );

        const $preview = this.createKanjiPreview(kanji);
        $element.append($preview);

        $element
            .on("click", () => {
                const isCurrentlySelected = this.selectedKanji.has(kanji.id);
                this.updateKanjiSelection($element, kanji, !isCurrentlySelected);
            })
            .on("mouseenter", () => {
                $preview.show();
            })
            .on("mouseleave", () => {
                $preview.hide();
            });

        return $element;
    }

    async render() {
        this.$container = $("<div>")
            .css({
                ...styles.practiceModal.grid,
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))"
            });

        this.kanji.forEach(kanji => {
            const $element = this.createKanjiElement(kanji);
            this.$container.append($element);
        });
        
        return this.$container;
    }
}

export default KanjiGrid;