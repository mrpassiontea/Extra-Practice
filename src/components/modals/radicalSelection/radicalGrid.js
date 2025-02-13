import { styles } from "../../../constants/index";
import { loadSvgContent } from "../../../handlers/practice/shared/index";

class RadicalGrid {
    constructor(radicals, onSelectionChange) {
        this.radicals = radicals;
        this.selectedRadicals = new Set();
        this.onSelectionChange = onSelectionChange;
        this.$container = null;
    }

    updateRadicalSelection($element, radical, isSelected) {
        $element.css(
            isSelected 
                ? { ...styles.practiceModal.radical.base, ...styles.practiceModal.radical.selected }
                : styles.practiceModal.radical.base
        );

        if (isSelected) {
            this.selectedRadicals.add(radical.id);
        } else {
            this.selectedRadicals.delete(radical.id);
        }

        this.onSelectionChange(this.selectedRadicals);
    }

    toggleAllRadicals(shouldSelect) {
        if (shouldSelect) {
            this.radicals.forEach(radical => this.selectedRadicals.add(radical.id));
        } else {
            this.selectedRadicals.clear();
        }

        this.$container.find(".radical-selection-item").each((_, element) => {
            const $element = $(element);
            const radicalId = parseInt($element.data("radical-id"));
            this.updateRadicalSelection(
                $element,
                this.radicals.find(r => r.id === radicalId),
                shouldSelect
            );
        });

        this.onSelectionChange(this.selectedRadicals);
    }

    getSelectedRadicals() {
        return Array.from(this.selectedRadicals).map(id => 
            this.radicals.find(radical => radical.id === id)
        );
    }

    async createRadicalElement(radical) {
        const $element = $("<div>")
            .addClass("radical-selection-item")
            .css(styles.practiceModal.radical.base)
            .data("radical-id", radical.id)
            .append(
                $("<div>")
                    .addClass("radical-character")
                    .css(styles.practiceModal.radical.character)
                    .text(radical.character || "")
            )
            .on("click", () => {
                const isCurrentlySelected = this.selectedRadicals.has(radical.id);
                this.updateRadicalSelection($element, radical, !isCurrentlySelected);
            });

        if (!radical.character && radical.svg) {
            try {
                const svgContent = await loadSvgContent(radical.svg);
                $element.find(".radical-character").html(svgContent);
                const svg = $element.find("svg")[0];
                if (svg) {
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "100%");
                }
            } catch (error) {
                console.error("Error loading SVG:", error);
                $element.find(".radical-character").text(radical.meaning);
            }
        }

        return $element;
    }

    async render() {
        this.$container = $("<div>")
            .css(styles.practiceModal.grid);

        // Create and append all radical elements
        const radicalElements = await Promise.all(
            this.radicals.map(radical => this.createRadicalElement(radical))
        );
        
        radicalElements.forEach($element => this.$container.append($element));
        
        return this.$container;
    }
}

export default RadicalGrid;