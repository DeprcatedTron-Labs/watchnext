function loadSupportedDomains() {
    // Retrieve the list of supported domains from storage
    chrome.storage.sync.get(["supportedDomains"], function (result) {
        const supportedDomains = result.supportedDomains || [];
        // Populate the list with supported domains
        for (const domain of supportedDomains) {
            addDomainToList(domain);
        }
    });
}

function addDomainToList(domain) {
    const domainList = document.getElementById("domainList");
    const listItem = document.createElement("li");
    listItem.textContent = domain;

    // Add a delete button to remove the domain from the list
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
        removeDomainFromList(domain);
    });

    // Append the delete button to the list item
    listItem.appendChild(deleteButton);

    domainList.appendChild(listItem);
}

function removeDomainFromList(domain) {
    const domainList = document.getElementById("domainList");
    const items = domainList.getElementsByTagName("li");
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].textContent === domain) {
            items[i].remove();
            break;
        }
    }

    // Update the supportedDomains list in chrome.storage
    chrome.storage.sync.get(["supportedDomains"], function (result) {
        const supportedDomains = result.supportedDomains || [];
        const updatedDomains = supportedDomains.filter(item => item !== domain);
        chrome.storage.sync.set({ "supportedDomains": updatedDomains });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadSupportedDomains();

    const addDomainButton = document.getElementById("addDomainButton");
    const newDomainInput = document.getElementById("newDomain");

    addDomainButton.addEventListener("click", function () {
        const newDomain = newDomainInput.value.trim();
        if (newDomain) {
            addDomainToList(newDomain);
            
            // Update the supportedDomains list in chrome.storage
            chrome.storage.sync.get(["supportedDomains"], function (result) {
                const supportedDomains = result.supportedDomains || [];
                supportedDomains.push(newDomain);
                chrome.storage.sync.set({ "supportedDomains": supportedDomains });
            });

            newDomainInput.value = "";
        }
    });
});
