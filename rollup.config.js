import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";


const header = `// ==UserScript==
// @name         Extra Practice
// @namespace    https://github.com/mrpassiontea/WaniKani-Extra-Practice
// @version      2025-02-08
// @description  Practice your current level's Radicals and Kanji
// @author       @mrpassiontea
// @match        *://*.wanikani.com/
// @match        *://*.wanikani.com/dashboard
// @match        *://*.wanikani.com/dashboard?*
// @copyright    2025, mrpassiontea
// @grant        none
// @grant        window.onurlchange
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      file://${process.cwd()}/dist/wanikani-extra-practice.user.js
// @license      MIT; http://opensource.org/licenses/MIT
// @run-at       document-end
// ==/UserScript==
`;

export default {
    input: "src/index.js",
    output: {
        file: "dist/wanikani-extra-practice.user.js",
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