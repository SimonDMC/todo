import { Popup } from './popup';

// https://stackoverflow.com/a/4238971/19271522
export function placeCaretAtEnd(el: HTMLInputElement) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        let range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        let sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export function getInnerHeight(el: HTMLElement) {
    let height = el.clientHeight;
    height -= parseInt(getComputedStyle(el).paddingTop) + parseInt(getComputedStyle(el).paddingBottom);
    return height;
}

export function getDataOverridePromise() {
    return new Promise(function(resolve, reject) {
        let accept = document.querySelector(".accept-override")!;
        let refuse = document.querySelector(".refuse-override")!;
        accept?.addEventListener("click", resolve);
        refuse?.addEventListener("click", reject);
    });
}

// create a random string of length n
export function randomString(n: number) {
    let result = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < n; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const overridePopup = new Popup({
    id: 'override',
    title: 'Data Conflict',
    content: `Your cloud data and local data are different. Which one do you want to use?
      big-margin§{btn-refuse-override}[Local Data]     {btn-accept-override}[Cloud Data]`,
    sideMargin: '1.5em',
    fontSizeMultiplier: '1.2',
    dynamicHeight: true,
    backgroundColor: '#FFFEE3',
    allowClose: false,
});