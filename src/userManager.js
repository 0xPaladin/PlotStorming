/*
  AI 

creative
  qwen/qwen3-235b-a22b-2507 .071/.1
  google/gemma-3-27b-it .08/.16
  google/gemini-2.5-flash-lite  .1/.4
  mistralai/mistral-small-3.2-24b-instruct .075/.2


long
  z-ai/glm-4.7-flash .06/.4
  bytedance-seed/seed-1.6-flash .075/.3
  xiaomi/mimo-v2-flash .09/.29

  type Response = {
    id: string;
    // Depending on whether you set "stream" to "true" and
    // whether you passed in "messages" or a "prompt", you
    // will get a different output shape
    choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
    created: number; // Unix timestamp
    model: string;
    object: 'chat.completion' | 'chat.completion.chunk';
    system_fingerprint?: string; // Only present if the provider supports it
    // Usage data is always returned for non-streaming.
    // When streaming, usage is returned exactly once in the final chunk
    // before the [DONE] message, with an empty choices array.
    usage?: ResponseUsage;
  };

  type NonStreamingChoice = {
    finish_reason: string | null;
    native_finish_reason: string | null;
    message: {
     content: string | null;
     role: string;
     tool_calls?: ToolCall[];
    };
    error?: ErrorResponse;
  };

  type StreamingChoice = {
    finish_reason: string | null;
    native_finish_reason: string | null;
    delta: {
      content: string | null;
      role?: string;
      tool_calls?: ToolCall[];
    };
    error?: ErrorResponse;
  };
*/

/*
  User Manager
*/
export class UserManager {
  constructor(app) {
    this.app = app;

    this.state = {
      keyOpenRouter: "",
      keyNvidia: "",
      folders: ["Setting", "Prompts", "Characters", "Writing"], //list of folder names for organization
      chat: ["", "", "", []],
      ...JSON.parse(localStorage.getItem("userData")),
    };

    //check for chat and update main ui
    if (this.activeChat.history.length > 0) {
      app.updateState("chat", this.activeChat.history);
    }

    getModels();
  }

  //get active chat
  get activeChat() {
    const chat = this.state.chat;
    const [provider, model, prompt, history] = chat;

    return {
      raw: chat,
      provider,
      model,
      prompt,
      history,
      last: history.length - 1,
    };
  }

  //update chat
  updateChat(idx, what) {
    //console.log(idx, what);
    //chat: ["", "", "", []],
    const chat = this.state.chat;
    //look for adding to chat
    if (idx === 3) {
      app.updateState("chat", what);
    }
    //now update
    chat[idx] = what;
    this.update("chat", chat);
  }

  /*
    Folder Functions
  */

  get folders() {
    return this.state.folders || [];
  }

  renameFolder(oldName, newName) {
    //update folder name in all content
    const CM = this.app.ContentManager;
    CM.all.forEach((c) => {
      if (c.folder === oldName) {
        c.folder = newName;
      }
    });
    CM.save();

    //update folder name in user data
    this.state.folders = this.state.folders.map((f) =>
      f === oldName ? newName : f,
    );
    this.app.updateState("userData", this.state);
    this.app.setSelected("rename-folder", null);
    this.app.refresh();
    console.log(newName);
  }

  deleteFolder(folderName) {
    //remove folder from all content
    const CM = this.app.ContentManager;
    CM.all.forEach((c) => {
      if (c.folder === folderName) {
        c.folder = null;
      }
    });
    CM.save();

    //remove folder from user data
    this.state.folders = this.state.folders.filter((f) => f !== folderName);

    //save
    this.app.updateState("userData", this.state);
    localStorage.setItem(`userData`, JSON.stringify(this.state));
  }

  /*
    Build and send payload for AI based upon schema
    payload for open router 
  */
  async sendPrompt(message, schema, target) {
    const { chat } = this.state;
    const [provder, model] = chat;
    const key = this.state["key" + provder];
    //urls
    const url = {
      OpenRouter: "https://openrouter.ai/api/v1/chat/completions",
      Nvidia: "https://integrate.api.nvidia.com/v1/chat/completions",
    }[provder];

    //call Open Router
    if (key && model) {
      //getResponse(url, key, model, messages, schema, target)
      getResponse(url, key, model, message, schema, target);
    }
  }

  update(key, val) {
    this.state[key] = val;
    this.app.updateState("userData", this.state);
    localStorage.setItem(`userData`, JSON.stringify(this.state));
  }

  /*
    Export data as JSON
  */
  async exportJSON() {
    const data = this.app.ContentManager.all;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    this.downloadFile(blob, `plotstorming-data-${Date.now()}.json`);

    this.app.notify({
      title: "Export Complete",
      message: "Data exported as JSON",
      color: "green",
    });
  }

  /*
    Export data as TXT (human-readable format)
  */
  async exportTXT() {
    const data = this.app.ContentManager.all;
    let txtContent = `PLOTSTORMING - DATA EXPORT\n`;
    txtContent += `Exported: ${data.timestamp}\n`;
    txtContent += `${"=".repeat(50)}\n\n`;

    // Each content gets its own section
    data.forEach((d) => {
      txtContent += `Name: ${d.name || "Unknown"}\n`;
      txtContent += d.text;
      txtContent += `${"-".repeat(5)}\n\n`;
    });

    const blob = new Blob([txtContent], { type: "text/plain" });
    this.downloadFile(blob, `plotstorming-data-${Date.now()}.txt`);

    this.app.UI.notify({
      title: "Export Complete",
      message: "Data exported as TXT",
      color: "green",
    });
  }

  /*
    Load data from JSON file
  */
  async loadJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        //content manager
        const CM = this.app.ContentManager;
        //load data
        data.forEach((d) => {
          let content = CM.data.find((c) => c.id === d.id);
          if (content) {
            //update
            content = { ...content, ...d };
          } else {
            //add
            CM.data.push(d);
          }
        });

        this.app.refresh();
        this.app.notify({
          title: "Import Complete",
          message: `Loaded ${data.length} items.`,
          color: "green",
        });
      } catch (error) {
        console.error("Error loading JSON:", error);
        this.app.notify({
          title: "Import Error",
          message: `Failed to load file: ${error.message}`,
          color: "red",
        });
      }
    };

    input.click();
  }

  /*
    Helper method to download file
  */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  render() {
    const { state } = this;
    const html = this.app.html || window.app.html;

    return html`
      <div class="container bg-black-10 pa2">
        <h3>Settings</h3>
        <div class="section">
          <div class="b i">OpenRouter Key</div>
          <input
            class="w-90"
            type="text"
            value=${state.keyOpenRouter}
            onChange=${(e) => this.update("keyOpenRouter", e.target.value)}
          />
        </div>
        <div class="section">
          <div class="b i">NVIDIA Key</div>
          <input
            class="w-90"
            type="text"
            value=${state.keyNvidia}
            onChange=${(e) => this.update("keyNvidia", e.target.value)}
          />
        </div>
        <div class="section">
          <h3>Save & Load Data</h3>
          <button
            class="w-100 mb2 btn-primary"
            onClick=${() => this.exportJSON()}
          >
            Export as JSON
          </button>
          <button class="w-100 btn-green" onClick=${() => this.exportTXT()}>
            Export as TXT
          </button>
        </div>

        <div class="section">
          <button class="w-100 btn-green" onClick=${() => this.loadJSON()}>
            Import JSON Data
          </button>
        </div>
      </div>
    `;
  }
}

function UpdateChatFromAi(response, target) {
  if (target) {
    //update text
    const text = target.text + response;
    app.ContentManager.update(target.id, "text", text);
  } else {
    //no target, update chat
    const { history, last } = app.UserManager.activeChat;
    //update last with delts
    history[last][1] += response;
    //update
    app.UserManager.updateChat(2, history);
  }
}

import OpenAi from "https://cdn.jsdelivr.net/npm/openai@6.34.0/+esm";

async function getResponse(url, key, model, messages, schema, target) {
  const app = window.app;

  const openai = new OpenAi({
    apiKey: key,
    baseURL: url,
  });

  //notify sent
  app.notify({
    title: "Prompt Sent",
    message: "Waiting for response...",
    color: "blue",
  });

  const completion = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    stream: true,
  });

  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta?.content || "";
    content !== "" ? UpdateChatFromAi(content, target) : null;
  }
}

//base NVIDIA list
const nvidiaModels = [
  "deepseek-ai/deepseek-r1-distill-qwen-32b",
  "deepseek-ai/deepseek-v3.1",
  "deepseek-ai/deepseek-v3.2",
  "google/gemma-4-31b-it",
  "minimaxai/minimax-m2.5",
  "minimaxai/minimax-m2.7",
  "mistralai/mistral-large",
  "mistralai/mistral-small-4-119b-2603",
  "moonshotai/kimi-k2-instruct",
  "moonshotai/kimi-k2-thinking",
  "moonshotai/kimi-k2.5",
  "nvidia/nemotron-3-super-120b-a12b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.5-397b-a17b",
  "stepfun-ai/step-3.5-flash",
  "z-ai/glm4.7",
  "z-ai/glm5",
];
/*
  Get a list of models from OpenRouter
*/
async function getModels() {
  const urls = {
    OpenRouter: "https://openrouter.ai/api/v1/models",
  };
  //Nvidia: "https://integrate.api.nvidia.com/v1/models",

  //models by provider
  const models = {
    OpenRouter: [],
    Nvidia: nvidiaModels
      .map((id) => {
        return { id, name: id };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };

  //for each url, load models
  for (const [key, url] of Object.entries(urls)) {
    axios
      .get(url)
      .then((response) => {
        //get model data
        const data = response.data;
        models[key] = data.data
          .map((m) => {
            return { id: m.id, name: m.name };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        key === "Nvidia" ? console.log(models) : "";
        //push to App
        window.app.updateState("models", models);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

/*
  //update target
    Promise.resolve(
      axios.post(invokeUrl, payload, {
        headers: headers,
        responseType: stream ? 'stream' : 'json'
      })
    )

      .then(response => {
        if (stream) {
          response.data.on('data', (chunk) => {
            console.log(chunk.toString());
          });
        } else {
          console.log(JSON.stringify(response.data));
        }
      })
      .catch(error => {
        console.error(error);
      });

      try {
        const response = await fetch(url, {
          method: "GET",
        });

        //get model data
        const data = await response.json();
        models[key] = data.data
          .map((m) => {
            return { id: m.id, name: m.name };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        key === "Nvidia" ? console.log(models) : "";
        //push to App
        window.app.updateState("models", models);
      } catch (error) {
        console.error(error.message);
      }


      async function getResponse(key, model, messages, schema, target) {
        const app = window.app;
        const url = "https://openrouter.ai/api/v1/chat/completions";
        try {
          //build body
          const body = {
            model: model,
            messages,
            stream: true,
          };
          //add schema if provided
          if (schema) {
            body.response_format = schema;
          }

          //notify sent
          app.notify({
            title: "Prompt Sent",
            message: "Waiting for response...",
            color: "blue",
          });
          //fetch from open router
          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            //notify
            app.notify({
              title: "Error",
              message: `Response status: ${response.status}`,
              color: "red",
            });

            throw new Error(`Response status: ${response.status}`);
          }

          //stream response
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Response body is not readable");
          }

          //decode buffer
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              //read buffer
              const { done, value } = await reader.read();
              if (done) break;
              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });

              // Process complete lines from buffer
              while (true) {
                //parse and decode
                const lineEnd = buffer.indexOf("\n");
                if (lineEnd === -1) break;
                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                //find data
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") break;
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      UpdateChatFromAi(content, target);
                    }
                  } catch (e) {
                    // Ignore invalid JSON
                  }
                }
              }
            }
          } finally {
            reader.cancel();
          }
        } catch (error) {
          console.error(error.message);
        }
      }

      async function getResponse(url, key, model, messages, schema, target) {
        const app = window.app;
        const stream = true;

        const headers = {
          Authorization: `Bearer ${key}`,
          Accept: stream ? "text/event-stream" : "application/json",
        };

        const payload = {
          model: model,
          reasoning_effort: "high",
          messages: messages,
          max_tokens: 16384,
          temperature: 0.9,
          top_p: 0.7,
          stream: true,
        };

        //notify sent
        app.notify({
          title: "Prompt Sent",
          message: "Waiting for response...",
          color: "blue",
        });

        //post
        axios
          .post(url, payload, {
            headers: headers,
            responseType: stream ? "stream" : "json",
          })
          .then((response) => {
            if (stream) {
              response.data.on("data", (chunk) => {
                UpdateChatFromAi(chunk.toString(), target);
              });
            } else {
              UpdateChatFromAi(JSON.stringify(response.data), target);
            }
          })
          .catch((error) => {
            console.error(error.status, error.message);
            //notify
            app.notify({
              title: "Error",
              message: `Response status: ${error.message}`,
              color: "red",
            });
          });
      }
*/
