import { PracticeButton } from "./index";
import { PRACTICE_TYPES } from "./types";
import { styles, SELECTORS } from "../../../constants/index";

export function initializePracticeButtons() {
    // First style the containers where the "PRACTICE" buttons be
    $(`${SELECTORS.DIV_LEVEL_PROGRESS_CONTENT} ${SELECTORS.DIV_CONTENT_WRAPPER} ${SELECTORS.DIV_CONTENT_TITLE}`)
        .css(styles.layout.contentTitle);

    const radicalButton = new PracticeButton(PRACTICE_TYPES.RADICAL);
    const kanjiButton = new PracticeButton(PRACTICE_TYPES.KANJI);

    radicalButton.render();
    kanjiButton.render();
}