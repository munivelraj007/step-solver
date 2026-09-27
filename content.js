// ==========================================
// STEP SOLVER - COMPACT FLOATING UI
// ==========================================

if (document.getElementById("step-solver-box")) {
    console.log("Step Solver already loaded.");
} else {

    const solverBox = document.createElement("div");

    solverBox.id = "step-solver-box";

    solverBox.innerHTML = `
        <div id="step-solver-header">

            <div id="solver-title">
                <span class="solver-logo">⚡</span>
                <span>Step Solver</span>
            </div>

            <div id="solver-controls">
                <button id="solver-minimize" title="Minimize">−</button>
                <button id="solver-close" title="Close">×</button>
            </div>

        </div>


        <div id="step-solver-content">

            <div id="solver-status-row">

                <div id="solver-status">
                    <span class="status-dot"></span>
                    <span id="status-text">Ready</span>
                </div>

                <div id="solver-mode">
                    IDLE
                </div>

            </div>


            <button id="solve-current">

                <span class="solve-icon">⚡</span>

                <span class="solve-label">
                    Solve Current
                </span>

                <span class="shortcut">
                    Alt + S
                </span>

            </button>


            <div id="auto-solve-row">

                <div class="auto-text">

                    <div class="auto-title">
                        Auto-Solve Next Question
                    </div>

                    <div class="auto-subtitle">
                        Detect next question automatically
                    </div>

                </div>


                <label class="switch">

                    <input
                        type="checkbox"
                        id="auto-solve"
                    >

                    <span class="slider"></span>

                </label>

            </div>


            <div id="solver-result">

                <div class="result-title">
                    ANSWER
                </div>

                <div id="answer-text">
                    Answer will appear here...
                </div>

            </div>

        </div>
    `;

    document.body.appendChild(solverBox);


    // ==========================================
    // ELEMENTS
    // ==========================================

    const header =
        document.getElementById("step-solver-header");

    const minimizeBtn =
        document.getElementById("solver-minimize");

    const closeBtn =
        document.getElementById("solver-close");

    const solveBtn =
        document.getElementById("solve-current");

    const autoSolve =
        document.getElementById("auto-solve");

    const content =
        document.getElementById("step-solver-content");

    const statusText =
        document.getElementById("status-text");

    const modeText =
        document.getElementById("solver-mode");

    const answerText =
        document.getElementById("answer-text");


    // ==========================================
    // CLOSE
    // ==========================================

    closeBtn.addEventListener("click", () => {

        solverBox.remove();

    });


    // ==========================================
    // MINIMIZE
    // ==========================================

    let minimized = false;

    minimizeBtn.addEventListener("click", () => {

        minimized = !minimized;

        if (minimized) {

            content.style.display = "none";

            minimizeBtn.textContent = "+";

        } else {

            content.style.display = "block";

            minimizeBtn.textContent = "−";

        }

    });


    // ==========================================
    // SOLVE CURRENT
    // ==========================================

    solveBtn.addEventListener("click", async () => {

        solveBtn.disabled = true;

        statusText.textContent =
            "Capturing...";

        modeText.textContent =
            "WORKING";

        answerText.textContent =
            "Reading current question...";

        try {

            const response =
                await chrome.runtime.sendMessage({
                    action: "captureScreen"
                });


            if (!response || !response.success) {

                throw new Error(
                    response?.error ||
                    "Unable to capture screen."
                );

            }


            statusText.textContent =
                "Solving...";


            const result =
                await chrome.runtime.sendMessage({

                    action: "solveWithGemini",

                    screenshot:
                        response.screenshot

                });


            if (!result || !result.success) {

                throw new Error(
                    result?.error ||
                    "Gemini could not solve the question."
                );

            }


            answerText.textContent =
                result.answer;

            statusText.textContent =
                "Done";

            modeText.textContent =
                "READY";


        } catch (error) {

            console.error(
                "Step Solver:",
                error
            );

            statusText.textContent =
                "Error";

            modeText.textContent =
                "ERROR";

            answerText.textContent =
                error.message;

        } finally {

            solveBtn.disabled = false;

        }

    });


    // ==========================================
    // AUTO SOLVE TOGGLE
    // ==========================================

    autoSolve.addEventListener("change", () => {

        if (autoSolve.checked) {

            statusText.textContent =
                "Auto-Solve ON";

            modeText.textContent =
                "AUTO";

        } else {

            statusText.textContent =
                "Ready";

            modeText.textContent =
                "IDLE";

        }

    });


    // ==========================================
    // DRAG WINDOW
    // ==========================================

    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;


    header.addEventListener("mousedown", (event) => {

        if (
            event.target.closest("button")
        ) {
            return;
        }


        dragging = true;


        const rect =
            solverBox.getBoundingClientRect();


        offsetX =
            event.clientX - rect.left;

        offsetY =
            event.clientY - rect.top;


        document.body.style.userSelect =
            "none";

    });


    document.addEventListener("mousemove", (event) => {

        if (!dragging) {
            return;
        }


        solverBox.style.left =
            `${event.clientX - offsetX}px`;

        solverBox.style.top =
            `${event.clientY - offsetY}px`;

        solverBox.style.right =
            "auto";

    });


    document.addEventListener("mouseup", () => {

        dragging = false;

        document.body.style.userSelect =
            "";

    });


    // ==========================================
    // ALT + S
    // ==========================================

    document.addEventListener("keydown", (event) => {

        if (
            event.altKey &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            if (!solveBtn.disabled) {
                solveBtn.click();
            }

        }

    });

}