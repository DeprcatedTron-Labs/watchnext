let savedLinks = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "saveLinks") {
        const newLinks = request.links.filter(link => !savedLinks.some(savedLink => savedLink.url === link.url));
        if (newLinks.length > 0) {
            saveLinks(newLinks);
        }
    } else if (request.action === "getSavedLinks") {
        sendResponse({ links: savedLinks });
    } else if (request.action === "removeLink" && request.linkIdentifier) {
        // Remove the link from the savedLinks array and update storage
        savedLinks = savedLinks.filter(link => link.url !== request.linkIdentifier);
        chrome.storage.local.set({ videoLinks: savedLinks });
    }
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === "save-main-video") {
    // Handle the keyboard shortcut here, e.g., trigger your save video logic.
    // For example, you can simulate a click on the save button.
    document.getElementById("saveMainVideoButton").click();
  }
});

function saveLinks(links) {
    savedLinks = savedLinks.concat(links);
    chrome.storage.local.set({ videoLinks: savedLinks });
}

chrome.storage.local.get("videoLinks", function (result) {
    if (result.videoLinks) {
        savedLinks = result.videoLinks;
    }
});








  
