import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";


const header = `// ==UserScript==
// @name         Extra Practice
// @namespace    https://github.com/mrpassiontea/Extra-Practice
// @version      2.0.0
// @description  Practice your current level's Radicals and Kanji with standard, english -> Kanji, and combination mode!
// @author       @mrpassiontea
// @match        https://www.wanikani.com/
// @match        *://*.wanikani.com/dashboard
// @match        *://*.wanikani.com/dashboard?*
// @copyright    2025, mrpassiontea
// @grant        none
// @grant        window.onurlchange
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      file://${process.cwd()}/dist/extra-practice.user.js
// @require      https://unpkg.com/wanakana@5.3.1/wanakana.min.js
// @license      MIT; http://opensource.org/licenses/MIT
// @run-at       document-end
// ==/UserScript==
`;

export default {
    input: "src/index.js",
    output: {
        file: "dist/extra-practice.user.js",
        format: "iife",
        sourcemap: true,
        intro: header
    },
    plugins: [
        nodeResolve(),
        replace({
            preventAssignment: true
        })
    ]
};