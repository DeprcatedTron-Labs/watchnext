 document.addEventListener("DOMContentLoaded", function () {
    const videoList = document.getElementById("videoList");
    const saveMainVideoButton = document.getElementById("saveMainVideoButton");
    const savedUrl = document.getElementById("savedUrl");

    // Function to check if the domain matches the manifest patterns
    function checkDomainMatch() {
        // Get the active tab's URL
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            const currentURL = activeTab.url;

            // Retrieve the list of matches from the manifest
            const matches = chrome.runtime.getManifest().content_scripts[0].matches;

            // Check if the active tab's URL matches any of the patterns
            const matchesAnyPattern = matches.some(pattern => currentURL.includes(pattern));

            // Debugging: Log whether there's a match
            console.log("Matches any pattern:", matchesAnyPattern);

            // Enable or disable the saveMainVideoButton based on whether there's a match
            saveMainVideoButton.disabled = !matchesAnyPattern;
        });
    }

    // Call the function to check domain matching
    checkDomainMatch();

    // Load saved video links from background script
    chrome.runtime.sendMessage({ action: "getSavedLinks" }, function (response) {
        if (response.links && response.links.length > 0) {
            response.links.forEach(function (link) {
                const listItem = document.createElement("li");
                const contentDiv = document.createElement("div");
                contentDiv.className = "video-link";

                const titleLink = document.createElement("a");
                titleLink.href = link.url; // Set the video URL as the link's href
                titleLink.textContent = link.title; // Set the video title as the link's text
                titleLink.target = "_blank"; // Open the link in a new tab

                // Append the title link to the content div
                contentDiv.appendChild(titleLink);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "X";
                deleteButton.className = "delete-button";
                deleteButton.addEventListener("click", function () {
                    // Get the link's unique identifier (e.g., link.url)
                    const linkIdentifier = link.url; // Adjust this based on your data structure

                    // Remove the link from the list
                    listItem.remove();

                    // Send a message to the background script to remove the link from memory
                    chrome.runtime.sendMessage({ action: "removeLink", linkIdentifier: linkIdentifier });
                });

                // Append the delete button to the content div
                contentDiv.appendChild(deleteButton);

                // Append the content div to the list item
                listItem.appendChild(contentDiv);

                // Append the list item to the videoList
                videoList.appendChild(listItem);
            });
        } else {
            // If no links are saved, you can display a message or handle it as needed
            const noLinksMessage = document.createElement("p");
            noLinksMessage.textContent = "No links saved yet.";
            videoList.appendChild(noLinksMessage);
        }
    });


    // Button click event to save the current tab URL
    saveMainVideoButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.runtime.sendMessage({
                action: "saveLinks",
                links: [{ url: activeTab.url, title: activeTab.title }],
            });
            savedUrl.textContent = "Saved URL: " + activeTab.url;
        });
    });
});

