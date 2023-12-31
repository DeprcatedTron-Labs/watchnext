document.addEventListener("DOMContentLoaded", function () {
    const videoList = document.getElementById("videoList");
    const saveMainVideoButton = document.getElementById("saveMainVideoButton");
    const savedUrl = document.getElementById("savedUrl");
    const undoDeleteButton = document.getElementById("undoDeleteButton");

    // Load saved video links from background script
    chrome.runtime.sendMessage({ action: "getSavedLinks" }, function (response) {
        if (response.links && response.links.length > 0) {
            response.links.forEach(function (link) {
                const listItem = document.createElement("li");
                const contentDiv = document.createElement("div");
                contentDiv.className = "video-link";

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "X";
                deleteButton.className = "delete-button";

                // Append the delete button to the content div
                contentDiv.appendChild(deleteButton);

                const titleLink = document.createElement("a");
                titleLink.href = link.url; // Set the video URL as the link's href
                titleLink.textContent = link.title; // Set the video title as the link's text
                titleLink.target = "_blank"; // Open the link in a new tab

                // Create a span element for the tab space
                const tabSpace = document.createElement("span");
                tabSpace.textContent = "   "; // Adjust the number of spaces as needed

                // Append the tab space, title link, and delete button to the content div
                contentDiv.appendChild(tabSpace);
                contentDiv.appendChild(titleLink);

                // Append the content div to the list item
                listItem.appendChild(contentDiv);

                // Append the list item to the videoList
                videoList.appendChild(listItem);

                deleteButton.addEventListener("click", function () {
                    // Get the link's unique identifier (e.g., link.url)
                    const linkIdentifier = link.url; // Adjust this based on your data structure

                    // Remove the link from the list
                    listItem.remove();

                    // Send a message to the background script to remove the link from memory
                    chrome.runtime.sendMessage({ action: "removeLink", linkIdentifier: linkIdentifier });
                    saveMainVideoButton.disabled = false;
                    saveMainVideoButton.textContent = "Save Video";
                });
            });
        } else {
            // If no links are saved, you can display a message or handle it as needed
            const noLinksMessage = document.createElement("p");
            noLinksMessage.textContent = "No links saved yet.";
            videoList.appendChild(noLinksMessage);
        }
    });

    function isCurrentTabUrlInList(currentURL, savedLinks) {
        return savedLinks.some(link => link.url === currentURL);
    }

    // Check if the active tab contains "youtube.com" in the URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const currentURL = activeTab.url;

        // Load saved video links from background script
        chrome.runtime.sendMessage({ action: "getSavedLinks" }, function (response) {
            const isCurrentTabUrlSaved = isCurrentTabUrlInList(currentURL, response.links);
            const matches = ["youtube.com", "vimeo.com", "netflix.com", "primevideo.com", "crunchyroll.com"];

            // Check if the active tab's URL matches any of the patterns
            const matchesAnyPattern = matches.some(pattern => currentURL.includes(pattern));

            if (response.links && response.links.length > 0) {
                // Check if the current tab's URL is in the list

                // Enable or disable the saveMainVideoButton based on whether there's a match
                if (isCurrentTabUrlSaved) {
                    saveMainVideoButton.disabled = true; // Disable the button
                    saveMainVideoButton.textContent = "Video Already Saved";
                } else {
                    saveMainVideoButton.disabled = false; // Enable the button
                }
            } else if (!matchesAnyPattern) {
                saveMainVideoButton.disabled = true; // Disable the button
                saveMainVideoButton.textContent = "Invalid Domain";
            } else {
                // If no links are saved, you can handle it as needed
                saveMainVideoButton.disabled = false; // Enable the button
            }
        });
    });

    // Button click event to save the current tab URL
    saveMainVideoButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.runtime.sendMessage({
                action: "saveLinks",
                links: [{ url: activeTab.url, title: activeTab.title }],
            });
            savedUrl.textContent = "Video Saved!";
            saveMainVideoButton.disabled = true;
            saveMainVideoButton.textContent = "Video Saved";
        });
    });
});
