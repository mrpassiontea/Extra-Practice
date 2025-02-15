// Theme constants for consistent values across the application
export const theme = {
    colors: {
        radical: "#0598e4",
        kanji: "#eb019c",
        white: "#FFFFFF",
        black: "#000000",
        gray: {
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827"
        },
        overlay: {
            dark: "rgba(0, 0, 0, 0.9)",
            medium: "rgba(0, 0, 0, 0.6)",
            light: "rgba(0, 0, 0, 0.3)"
        },
        success: "#10B981",
        error: "#EF4444",
        info: "#3B82F6"
    },
    spacing: {
        xs: "0.5rem",    // 8px
        sm: "0.75rem",   // 12px
        md: "1rem",      // 16px
        lg: "1.5rem",    // 24px
        xl: "2rem",      // 32px
        xxl: "3rem"      // 48px
    },
    typography: {
        fontSize: {
            xs: "0.875rem",    // 14px
            sm: "1rem",        // 16px
            md: "1.25rem",     // 20px
            lg: "1.5rem",      // 24px
            xl: "2rem",        // 32px
            "2xl": "6rem"      // 96px (for the big character display)
        },
        fontWeight: {
            normal: "400",
            medium: "500",
            bold: "700"
        }
    },
    borderRadius: {
        sm: "3px",
        md: "4px",
        lg: "8px"
    },
    zIndex: {
        modal: 99999
    }
};

// Common style mixins for reusable patterns
export const mixins = {
    flexCenter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    flexBetween: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    modalBackdrop: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: theme.zIndex.modal
    },
    button: {
        base: {
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.md,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: "pointer",
            transition: "all 0.2s ease"
        },
        primary: (color) => ({
            backgroundColor: color,
            color: theme.colors.white,
            border: "none"
        }),
        outline: (color) => ({
            backgroundColor: "transparent",
            color: color,
            border: `1px solid ${color}`
        })
    }
};

// Component-specific styles
export const styles = {
    layout: {
        contentTitle: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }
    },

    buttons: {
        practice: {
            radical: {
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.radical,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                color: theme.colors.white,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer"
            },
            kanji: {
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.kanji,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                color: theme.colors.white,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer"
            }
        }
    },

    practiceModal: {
        backdrop: {
            ...mixins.modalBackdrop,
            backgroundColor: theme.colors.overlay.dark,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        },
        contentWrapper: {
            width: "100%",
            maxWidth: "800px",
            padding: `0 ${theme.spacing.xl}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        welcomeText: {
            container: {
                color: theme.colors.white,
                textAlign: "center",
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.md,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "750px"
            },
            username: {
                fontSize: theme.typography.fontSize.xl,
                marginBottom: theme.spacing.md
            }
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(100px, 1fr))",
            gap: theme.spacing.md,
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            maxHeight: "50vh",
            maxWidth: "600px",
            margin: "0 auto",
            justifyContent: "center"
        },
        radical: {
            base: {
                background: "rgba(255, 255, 255, 0.1)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.2s ease"
            },
            selected: {
                background: "rgba(5, 152, 228, 0.3)",
                border: `2px solid ${theme.colors.radical}`
            },
            character: {
                fontSize: theme.typography.fontSize.xl,
                color: theme.colors.white
            },
            meaning: {
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: theme.typography.fontSize.xs
            }
        },
        buttons: {
            selectAll: {
                color: theme.colors.white,
                background: "transparent",
                border: `1px solid ${theme.colors.white}`,
                cursor: "pointer",
                fontSize: theme.typography.fontSize.xs,
                marginBottom: theme.spacing.md,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                fontWeight: theme.typography.fontWeight.bold,
            },
            start: {
                base: {
                    backgroundColor: theme.colors.radical,
                    color: theme.colors.white,
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    borderRadius: theme.borderRadius.md,
                    border: "none",
                    fontWeight: theme.typography.fontWeight.medium,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    opacity: "1"
                },
                disabled: {
                    opacity: "0.5",
                    cursor: "not-allowed",
                    pointerEvents: "none"
                }
            },
            exit: {
                border: `1px solid ${theme.colors.white}`,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                color: theme.colors.black,
                fontWeight: theme.typography.fontWeight.medium,
                borderRadius: theme.borderRadius.sm,
                cursor: "pointer"
            }
        },
        footer: {
            padding: `${theme.spacing.md} ${theme.spacing.xl}`,
            display: "flex",
            justifyContent: "center",
            width: "100%",
            maxWidth: "600px",
            gap: theme.spacing.md
        }
    },

    reviewModal: {
        backdrop: {
            ...mixins.modalBackdrop,
            backgroundColor: theme.colors.overlay.dark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        container: {
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            width: "100%",
            display: "flex",
            flexDirection: "column"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.gray[200]}`,
            gap: theme.spacing.md
        },
        progress: {
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.gray[800]
        },
        content: {
            padding: theme.spacing.xl,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: theme.spacing.xl,
            textAlign: "center"
        },
        character: {
            fontSize: theme.typography.fontSize["2xl"],
            color: theme.colors.gray[800],
            marginBottom: theme.spacing.xl
        },
        inputSection: {
            width: "100%",
            display: "flex",
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl
        },
        input: {
            flex: "1",
            padding: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[300]}`
        },
        buttons: {
            submit: {
                backgroundColor: theme.colors.info,
                color: theme.colors.white,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.md,
                border: "none",
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                "&:hover": {
                    backgroundColor: "#2563EB"
                }
            },
            exit: {
                backgroundColor: "transparent",
                color: theme.colors.kanji,
                border: `1px solid ${theme.colors.kanji}`,
                borderRadius: theme.borderRadius.md,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                "&:hover": {
                    backgroundColor: theme.colors.gray[100]
                }
            },
            hint: {
                backgroundColor: "transparent",
                color: theme.colors.info,
                border: `1px solid ${theme.colors.info}`,
                borderRadius: theme.borderRadius.md,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                "&:hover": {
                    backgroundColor: theme.colors.gray[100]
                }
            }
        },
        results: {
            message: {
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.md,
                color: theme.colors.info,
                textAlign: "center",
                "&.correct": {
                    color: theme.colors.success
                },
                "&.incorrect": {
                    color: theme.colors.error
                }
            }
        },
        explanation: {
            lineHeight: "1.6",
            color: theme.colors.gray[600],
            fontSize: theme.typography.fontSize.md,
            meaningLabel: {
                display: "inline-block",
                fontWeight: theme.typography.fontWeight.normal,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.gray[800],
                marginRight: theme.spacing.xs
            },
            meaningText: {
                display: "inline-block",
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.radical[800],
                textDecoration: "none"
            },
            mnemonicContainer: {
                marginTop: theme.spacing.md,
                textAlign: "left",
                lineHeight: "1.6"
            },
            mnemonicLabel: {
                display: "block",
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.gray[800],
                marginBottom: theme.spacing.xs
            },
            mnemonic: {
                color: theme.colors.gray[600],
                fontSize: theme.typography.fontSize.md
            },
            mnemonicHighlight: {
                backgroundColor: theme.colors.gray[200],
                padding: `0 ${theme.spacing.xs}`,
                borderRadius: theme.borderRadius.sm,
                color: theme.colors.gray[800]
            }
        }
    }
};

// Export everything
export default {
    theme,
    mixins,
    styles
};