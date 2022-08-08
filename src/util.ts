// https://stackoverflow.com/a/4238971/19271522
export function placeCaretAtEnd(el: HTMLInputElement) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export function getInnerHeight(el: HTMLElement) {
    let height = el.clientHeight;
    height -= parseInt(getComputedStyle(el).paddingTop) + parseInt(getComputedStyle(el).paddingBottom);
    return height;
}