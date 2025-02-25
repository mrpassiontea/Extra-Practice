import { theme, ENDLESS_MODES, styles } from "../../../constants/index";

class EndlessToggle {
    constructor(isKanji = false, onEndlessModeChange = () => {}) {
        this.isKanji = isKanji;
        this.onEndlessModeChange = onEndlessModeChange;
        this.activeColor = this.isKanji ? theme.colors.kanji : theme.colors.radical;
        this.endlessMode = ENDLESS_MODES.DISABLED;
    }

    createToggleSwitch() {
        const $container = $("<div>")
            .css({
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.md
            });

        const $toggleWrapper = $("<div>")
            .css({
                position: "relative",
                width: "60px",
                height: "30px",
                cursor: "pointer"
            });

        const $track = $("<div>")
            .css({
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "34px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease"
            });

        const $thumb = $("<div>")
            .css({
                position: "absolute",
                height: "26px",
                width: "26px",
                left: "2px",
                bottom: "2px",
                backgroundColor: theme.colors.white,
                borderRadius: "50%",
                transition: "all 0.3s ease"
            });

        const $text = $("<div>")
            .text("Endless Mode")
            .css({
                color: theme.colors.white,
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.medium
            });

        const $modeOptions = $("<div>")
            .attr("id", "endless-mode-options")
            .css({
                display: "flex",
                opacity: 0,
                gap: theme.spacing.md,
                marginTop: theme.spacing.sm,
                justifyContent: "center",
                width: "100%",
                transition: "all 0.3s ease",
                transform: "translateY(-10px)",
                visibility: "hidden"
            });

        const createModeButton = (mode, label) => {
            const baseStyles = {
                backgroundColor: "transparent",
                border: `2px solid ${theme.colors.white}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.white,
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: theme.typography.fontSize.sm
            };

            const selectedStyles = {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: `2px solid ${this.activeColor}`,
                color: this.activeColor
            };

            const hoverStyles = {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: this.activeColor
            };

            return $("<button>")
                .text(label)
                .css({
                    ...styles.practiceModal.modeSelector.option.base,
                    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                    fontSize: theme.typography.fontSize.sm
                })
                .on("click", function() {
                    const $button = $(this);
                    
                    // Reset all buttons to base style
                    $modeOptions.find("button").css(styles.practiceModal.modeSelector.option.base);
                    
                    $button.css({
                        ...styles.practiceModal.modeSelector.option.base,
                        ...styles.practiceModal.modeSelector.option.selected
                    });
                    
                    this.endlessMode = mode;
                    this.onEndlessModeChange(mode);
                }.bind(this))
                .hover(
                    function() {
                        if (this.endlessMode !== mode) {
                            $(this).css(hoverStyles);
                        }
                    }.bind(this),
                    function() {
                        if (this.endlessMode !== mode) {
                            $(this).css(baseStyles);
                        }
                    }.bind(this)
                );
        };

        const $normalButton = createModeButton(ENDLESS_MODES.NORMAL, "Normal");
        const $hardcoreButton = createModeButton(ENDLESS_MODES.HARDCORE, "Hardcore");
        $modeOptions.append($normalButton, $hardcoreButton);

        $toggleWrapper.on("click", () => {
            const isEnabled = this.endlessMode !== ENDLESS_MODES.DISABLED;
            
            if (!isEnabled) {
                this.endlessMode = ENDLESS_MODES.NORMAL;
                $track.css({
                    backgroundColor: this.activeColor,
                    borderColor: this.activeColor
                });
                $thumb.css({
                    transform: "translateX(30px)"
                });
                
                // Show options with animation
                $modeOptions.css({
                    visibility: "visible"
                });
                setTimeout(() => {
                    $modeOptions.css({
                        opacity: 1,
                        transform: "translateY(0)"
                    });
                    $normalButton.trigger("click");
                }, 50);
            } else {
                this.endlessMode = ENDLESS_MODES.DISABLED;
                $track.css({
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.2)"
                });
                $thumb.css({
                    transform: "translateX(0)"
                });
                
                // Hide options with animation
                $modeOptions.css({
                    opacity: 0,
                    transform: "translateY(-10px)"
                });
                setTimeout(() => {
                    $modeOptions.css({
                        visibility: "hidden"
                    });
                }, 300);
            }

            this.onEndlessModeChange(this.endlessMode);
        });

        $toggleWrapper.append($track, $thumb);
        
        const $toggleRow = $("<div>")
            .css({
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.lg,
                width: "100%"
            })
            .append($text, $toggleWrapper);

        $container.append($toggleRow, $modeOptions);

        return $container;
    }
}

export default EndlessToggle;