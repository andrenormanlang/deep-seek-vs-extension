"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollama_1 = __importDefault(require("ollama"));
function activate(context) {
    const disposable = vscode.commands.registerCommand("deep-seek-vs.helloWorld", () => {
        const panel = vscode.window.createWebviewPanel("deepChat", "Deep Seek Chat", vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "chat") {
                const userPrompt = message.text;
                let responseText = "";
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: "deepseek-r1:8b",
                        messages: [{ role: "user", content: userPrompt }],
                        stream: true,
                    });
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({
                            command: "chatResponse",
                            text: responseText,
                        });
                    }
                }
                catch (err) {
                    console.error("Error in chat:", err); // Log the error for debugging
                    panel.webview.postMessage({
                        command: "chatResponse",
                        text: `Error: ${String(err)}`,
                    });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 1rem;
          }
          #prompt {
            width: 100%;
            box-sizing: border-box;
          }
          #response {
            border: 1px solid #ccc;
            margin-top: 1rem;
            padding: 0.5rem;
            min-height: 100px;
            white-space: pre-wrap; /* Preserve formatting for response text */
          }
          #askBtn {
            margin-top: 0.5rem;
          }
          .loading {
            display: none; /* Hidden by default */
            color: #666;
            font-style: italic;
          }
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deep Seek Chat</title>
      </head>
      <body>
        <h2>Deep Seek Chat</h2>
        <textarea id="prompt" rows="3" placeholder="Type your message here"></textarea>
        <button id="askBtn">Ask</button>
        <div class="loading" id="loading">Loading...</div>
        <div id="response"></div>
        <script>
          const vscode = acquireVsCodeApi();

          document.getElementById("askBtn").addEventListener("click", async () => {
            const text = document.getElementById("prompt").value;
            document.getElementById("loading").style.display = "block"; // Show loading indicator
            document.getElementById("response").innerText = ""; // Clear previous response
            vscode.postMessage({ command: "chat", text });
          });

          window.addEventListener("message", (event) => {
            const { command, text } = event.data;
            if (command === "chatResponse") {
              document.getElementById("response").innerText = text;
              document.getElementById("loading").style.display = "none"; // Hide loading indicator
            }
          });
        </script>
      </body>
    </html>`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map