function extractThumbnailUrlFromMetaTags() {
    const metaTags = document.querySelectorAll('meta[property="og:image"]');
    for (const tag of metaTags) {
        const thumbnailUrl = tag.getAttribute('content');
        if (thumbnailUrl) {
            return thumbnailUrl;
        }
    }
    return null;
}

chrome.runtime.onMessage.addListener(async function (request) {
    if (request.action === "saveMainVideo") {
        console.log("Received saveMainVideo request");
        const videoLink = window.location.href;
        const videoTitle = document.title;
        const thumbnailUrl = extractThumbnailUrlFromMetaTags();

        if (thumbnailUrl) {
            chrome.runtime.sendMessage({
                action: "saveLinks",
                links: [{ url: videoLink, titleAndUrl: videoTitle, thumbnailUrl: thumbnailUrl }],
            });
        } else {
            chrome.runtime.sendMessage({
                action: "saveLinks",
                links: [{ url: videoLink, titleAndUrl: videoTitle }],
            });
        }
    }
});
