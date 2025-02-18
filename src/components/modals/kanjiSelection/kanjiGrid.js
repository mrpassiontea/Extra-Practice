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

        $element
            .on("click", () => {
                const isCurrentlySelected = this.selectedKanji.has(kanji.id);
                this.updateKanjiSelection($element, kanji, !isCurrentlySelected);
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