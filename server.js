const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());

app.use(
    express.json({
        limit: "20mb"
    })
);

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Step Solver Backend is running"
    });

});


// ==========================================
// GEMINI SOLVE ROUTE
// ==========================================

app.post("/api/solve", async (req, res) => {

    try {

        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                success: false,
                error: "Gemini API key not configured on server."
            });

        }


        const { screenshot } =
            req.body;


        if (!screenshot) {

            return res.status(400).json({
                success: false,
                error: "Screenshot not received."
            });

        }


        const base64Image =
            screenshot.split(",")[1];


        if (!base64Image) {

            return res.status(400).json({
                success: false,
                error: "Invalid screenshot data."
            });

        }


        const prompt = `
You are an MCQ study assistant.

Look carefully at the screenshot.

Identify the main multiple-choice question and its visible options.

Ignore:
- browser UI
- advertisements
- unrelated text
- navigation menus
- timers
- buttons unrelated to the question

Return the result in this format:

QUESTION:
[question]

OPTIONS:
A. [option A]
B. [option B]
C. [option C]
D. [option D]

ANSWER:
[correct option letter and option text]

EXPLANATION:
[short explanation]

If the screenshot does not contain a clear MCQ,
say:
"MCQ not detected."
`;


        const response =
            await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-goog-api-key":
                            GEMINI_API_KEY
                    },

                    body: JSON.stringify({

                        contents: [

                            {
                                role: "user",

                                parts: [

                                    {
                                        text:
                                            prompt
                                    },

                                    {
                                        inline_data: {

                                            mime_type:
                                                "image/png",

                                            data:
                                                base64Image

                                        }
                                    }

                                ]

                            }

                        ],

                        generationConfig: {

                            temperature: 0.1,

                            maxOutputTokens: 800

                        }

                    })

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            return res.status(
                response.status
            ).json({

                success: false,

                error:
                    `Gemini API Error: ${errorText}`

            });

        }


        const result =
            await response.json();


        const parts =
            result
                ?.candidates?.[0]
                ?.content?.parts || [];


        const answer =
            parts
                .map(
                    part =>
                        part.text || ""
                )
                .join("\n")
                .trim();


        if (!answer) {

            return res.status(500).json({

                success: false,

                error:
                    "Gemini returned an empty answer."

            });

        }


        res.json({

            success: true,

            answer: answer

        });


    } catch (error) {

        console.error(
            "Server Error:",
            error
        );

        res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Step Solver backend running on http://localhost:${PORT}`
        );

    }
);