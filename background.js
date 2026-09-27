// ==========================================
// STEP SOLVER - BACKGROUND SERVICE WORKER
// ==========================================


// ==========================================
// MESSAGE HANDLER
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        // --------------------------------------
        // CAPTURE SCREEN
        // --------------------------------------

        if (message.action === "captureScreen") {

            chrome.tabs.captureVisibleTab(
                sender.tab.windowId,
                {
                    format: "png"
                }
            )
            .then((screenshot) => {

                sendResponse({
                    success: true,
                    screenshot: screenshot
                });

            })
            .catch((error) => {

                sendResponse({
                    success: false,
                    error: error.message
                });

            });

            return true;
        }


        // --------------------------------------
        // SOLVE THROUGH BACKEND
        // --------------------------------------

        if (message.action === "solveWithGemini") {

            solveThroughBackend(
                message.screenshot
            )
            .then((result) => {

                sendResponse({
                    success: true,
                    answer: result.answer
                });

            })
            .catch((error) => {

                console.error(
                    "Backend Error:",
                    error
                );

                sendResponse({
                    success: false,
                    error: error.message
                });

            });

            return true;
        }

    }
);


// ==========================================
// SEND SCREENSHOT TO BACKEND
// ==========================================

async function solveThroughBackend(screenshot) {

    if (!screenshot) {

        throw new Error(
            "Screenshot not received."
        );

    }


    const response =
        await fetch(
            "http://localhost:3000/api/solve",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    screenshot: screenshot
                })
            }
        );


    const result =
        await response.json();


    if (!response.ok || !result.success) {

        throw new Error(
            result?.error ||
            `Backend request failed (${response.status})`
        );

    }


    return result;

}