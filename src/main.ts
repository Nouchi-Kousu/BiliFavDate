// @ts-ignore isolatedModules
console.log("hello world");

interface eleCallback {
    (elements: HTMLSpanElement[]): void;
}
type media = {
    fav_time: number;
    [key: string]: unknown;
};
const favSpanSelector =
    ".items .items__item .bili-video-card__text span[title]";

const waitForElement = (selector: string, callback: eleCallback) => {
    const targetNode = document.body;
    const observer = new MutationObserver(() => {
        const el: HTMLSpanElement[] = Array.from(
            document.querySelectorAll(selector)
        );
        if (el.length) {
            observer.disconnect();
            callback(el);
        }
    });
    observer.observe(targetNode, { childList: true, subtree: true });
};

const elementModification = (medias: media[], elements: HTMLSpanElement[]) => {
    if (medias.length !== elements.length) return;

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].title.includes("2年前")) {
            const favTime = new Date(medias[i].fav_time * 1000);
            const yyyy = favTime.getFullYear();
            const mm = String(favTime.getMonth() + 1).padStart(2, "0");
            const dd = String(favTime.getDate()).padStart(2, "0");
            elements[i].title = elements[i].title.replace(
                "2年前",
                `${yyyy}-${mm}-${dd}`
            );
            elements[i].innerHTML = elements[i].innerHTML.replace(
                "2年前",
                `${yyyy}-${mm}-${dd}`
            );
        }
    }
};

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const clone = response.clone();
    const url = args[0] instanceof Request ? args[0].url : args[0];
    if (
        clone.headers.get("content-type") ===
            "application/json; charset=utf-8" &&
        String(url).includes("fav/resource/list")
    ) {
        const data = await clone.json();
        if (data?.data?.medias) {
            console.log("Fetched media data:", data.data.medias);
            waitForElement(favSpanSelector, (elements) => {
                elementModification(data.data.medias, elements);
            });
        }
    }
    return response;
};
