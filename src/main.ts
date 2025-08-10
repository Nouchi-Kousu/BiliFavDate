// @ts-ignore isolatedModules
console.log("hello world");

interface eleCallback {
    (elements: HTMLElement[]): void;
}
type media = {
    fav_time: number;
    [key: string]: unknown;
};
type followListItem = {
    mtime: number;
    [key: string]: unknown;
};
const favSpanSelector =
    ".items .items__item .bili-video-card__text span[title]";
const followDivSelector = ".items .item div.relation-card-info-option";

const waitForElement = (selector: string, callback: eleCallback) => {
    const targetNode = document.body;
    const observer = new MutationObserver(() => {
        const el: HTMLElement[] = Array.from(
            document.querySelectorAll(selector)
        );
        if (el.length) {
            observer.disconnect();
            callback(el);
        }
    });
    observer.observe(targetNode, { childList: true, subtree: true });
};

const favElementModification = (medias: media[], elements: HTMLElement[]) => {
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

const createFollowDateChild = (followTime: number) => {
    const followDate = new Date(followTime * 1000);
    const yyyy = followDate.getFullYear();
    const mm = String(followDate.getMonth() + 1).padStart(2, "0");
    const dd = String(followDate.getDate()).padStart(2, "0");
    const followDateStr =
        yyyy === new Date().getFullYear()
            ? `${mm}-${dd}`
            : `${yyyy}-${mm}-${dd}`;
    const followDateChild = document.createElement("div");
    followDateChild.style.color = "rgb(97,102,109)";
    followDateChild.style.fontSize = "12px";
    followDateChild.style.marginLeft = "12px";
    followDateChild.title = `关注于${followDateStr}`;
    followDateChild.setAttribute("data-follow-time", followTime.toString());
    followDateChild.innerHTML = `关注于${followDateStr}`;
    return followDateChild;
};

const followElementModification = (
    followList: followListItem[],
    elements: HTMLElement[]
) => {
    if (followList.length !== elements.length) return;

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].querySelector("div[data-follow-time]")) {
            continue;
        }
        const followDateChild = createFollowDateChild(followList[i].mtime);
        elements[i].appendChild(followDateChild);
    }
};

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const clone = response.clone();
    const url = args[0] instanceof Request ? args[0].url : args[0];
    if (
        clone.headers.get("content-type") === "application/json; charset=utf-8"
    ) {
        if (String(url).includes("fav/resource/list")) {
            const data = await clone.json();
            if (data.data.medias) {
                // console.log("Fetched media data:", data.data.medias);
                waitForElement(favSpanSelector, (elements) => {
                    favElementModification(data.data.medias, elements);
                });
            }
        } else if (
            String(url).includes("x/relation/followings") ||
            String(url).includes("x/relation/fans")
        ) {
            const data = await clone.json();
            if (data.data.list) {
                waitForElement(followDivSelector, (elements) => {
                    followElementModification(data.data.list, elements);
                });
            }
        }
    }
    return response;
};
