const apiKeyInput = document.getElementById("apiKey");
const saveKeyBtn = document.getElementById("saveKey");
const statusText = document.getElementById("status");


// Load saved API key
chrome.storage.local.get(["geminiApiKey"], (data) => {

    if (data.geminiApiKey) {
        apiKeyInput.value = data.geminiApiKey;
        statusText.textContent = "API Key saved ✓";
    }

});


// Save API key
saveKeyBtn.addEventListener("click", async () => {

    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {

        statusText.textContent =
            "Please enter your Gemini API key.";

        return;
    }

    await chrome.storage.local.set({
        geminiApiKey: apiKey
    });

    statusText.textContent =
        "API Key saved ✓";

});