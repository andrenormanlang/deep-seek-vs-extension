import * as vscode from "vscode";
import ollama from "ollama";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "deep-seek-vs.helloWorld",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "deepChat",
        "Deep Seek Chat",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(async (message: any) => {
        if (message.command === "chat") {
          const userPrompt = message.text;
          let responseText = "";

          try {
            const streamResponse = await ollama.chat({
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
          } catch (err) {
            console.error("Error in chat:", err); // Log the error for debugging
            panel.webview.postMessage({
              command: "chatResponse",
              text: `Error: ${String(err)}`,
            });
          }
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
	return /*html*/ `
	  <!DOCTYPE html>
	  <html lang="en">
		<head>
		  <meta charset="UTF-8" />
		  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		  <title>Deep Seek Chat</title>
		  <style>
			/* Reset & Global Dark Theme Styles */
			* {
			  margin: 0;
			  padding: 0;
			  box-sizing: border-box;
			}
			html, body {
			  height: 100%;
			  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			  background-color: #1e1e1e;
			  color: #d4d4d4;
			}
			body {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			  padding: 2rem;
			}
  
			/* Container Styling */
			.container {
			  width: 100%;
			  max-width: 800px;
			  background-color: #252526;
			  border-radius: 8px;
			  padding: 2rem;
			  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
			}
			h2 {
			  text-align: center;
			  margin-bottom: 1.5rem;
			  color: #ffffff;
			  font-size: 1.8rem;
			}
  
			/* Input Area Styles */
			textarea {
			  width: 100%;
			  padding: 1rem;
			  font-size: 1rem;
			  background-color: #1e1e1e;
			  color: #d4d4d4;
			  border: 1px solid #3c3c3c;
			  border-radius: 6px;
			  resize: vertical;
			  transition: border-color 0.2s ease;
			}
			textarea:focus {
			  outline: none;
			  border-color: #007acc;
			}
			textarea::placeholder {
			  color: #888;
			}
  
			/* Button Styles */
			button {
			  display: block;
			  width: 100%;
			  padding: 0.75rem;
			  margin-top: 1rem;
			  background-color: #007acc;
			  color: #fff;
			  border: none;
			  border-radius: 6px;
			  font-size: 1rem;
			  cursor: pointer;
			  transition: background-color 0.2s ease, transform 0.1s ease;
			}
			button:hover {
			  background-color: #005a9e;
			}
			button:active {
			  transform: scale(0.98);
			}
  
			/* Feedback & Response Styles */
			.loading {
			  margin-top: 1rem;
			  font-style: italic;
			  color: #aaaaaa;
			  text-align: center;
			  display: none;
			}
			#response {
			  margin-top: 1.5rem;
			  padding: 1rem;
			  border: 1px solid #3c3c3c;
			  border-radius: 6px;
			  background-color: #1e1e1e;
			  min-height: 120px;
			  white-space: pre-wrap;
			  font-family: Consolas, Monaco, 'Courier New', monospace;
			  overflow-y: auto;
			  max-height: 300px;
			}
			/* Custom Scrollbar for Response */
			#response::-webkit-scrollbar {
			  width: 8px;
			}
			#response::-webkit-scrollbar-track {
			  background: #2d2d2d;
			  border-radius: 4px;
			}
			#response::-webkit-scrollbar-thumb {
			  background: #555;
			  border-radius: 4px;
			}
		  </style>
		</head>
		<body>
		  <div class="container">
			<h2>Deep Seek Local Chat</h2>
			<textarea id="prompt" rows="3" placeholder="Type your message here..."></textarea>
			<button id="askBtn">Ask</button>
			<div class="loading" id="loading">Loading...</div>
			<div id="response"></div>
		  </div>
		  <script>
			const vscode = acquireVsCodeApi();
  
			document.getElementById("askBtn").addEventListener("click", () => {
			  const promptElement = document.getElementById("prompt");
			  const loadingElement = document.getElementById("loading");
			  const responseElement = document.getElementById("response");
			  const text = promptElement.value.trim();
  
			  if (!text) {
				// Optionally, display a warning message here.
				return;
			  }
  
			  loadingElement.style.display = "block";
			  responseElement.innerText = "";
  
			  vscode.postMessage({ command: "chat", text });
			});
  
			window.addEventListener("message", (event) => {
			  const { command, text } = event.data;
			  if (command === "chatResponse") {
				document.getElementById("response").innerText = text;
				document.getElementById("loading").style.display = "none";
			  }
			});
		  </script>
		</body>
	  </html>
	`;
  }
  
  

export function deactivate() {}