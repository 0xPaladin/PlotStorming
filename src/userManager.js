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
    this.router = null;

    this.state = {
      key: null,
      model: "google/gemma-3-27b-it",
      folders: ["Setting", "Prompts", "Characters", "Writing"], //list of folder names for organization
      chat: ["google/gemma-3-27b-it", "", []],
      ...JSON.parse(localStorage.getItem("userData")),
    };

    getModels();
  }

  //get active chat
  get activeChat() {
    const chat = this.state.chat;
    const [model, prompt, history] = chat;

    return {
      raw: chat,
      model,
      prompt,
      history,
      last: history.length - 1,
    };
  }

  //update chat
  updateChat(idx, what) {
    const chat = this.state.chat;
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
    const { key, chat } = this.state;
    const model = chat[0];

    //call Open Router
    if (key && model) {
      getResponse(key, model, message, schema, target);
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

        // Load characters
        if (data.characters && Array.isArray(data.characters)) {
          for (const char of data.characters) {
            App.CharacterManager.data.push(char);
          }
        }

        // Load locations
        if (data.locations && Array.isArray(data.locations)) {
          for (const loc of data.locations) {
            App.LocationManager.data.push(loc);
          }
        }

        // Save to local storage
        if (App.CharacterManager?.save) App.CharacterManager.save();
        if (App.LocationManager?.save) App.LocationManager.save();

        App.UI.refresh();
        App.UI.notify({
          title: "Import Complete",
          message: `Loaded ${data.characters?.length || 0} characters and ${data.locations?.length || 0} locations`,
          color: "green",
        });
      } catch (error) {
        console.error("Error loading JSON:", error);
        App.UI.notify({
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
            value=${state.key}
            onChange=${(e) => this.update("key", e.target.value)}
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

    const result = await response.json();
    const delta = result.choices[0].delta.content;

    //update target
    if (target) {
      //update text
      const text = target.text + delta;
      app.ContentManager.update(target.id, "text", text);
    } else {
      //no target, update chat
      const { history, last } = app.UserManager.activeChat;
      //update last with delts
      history[last].content += delta;
      //update
      app.UserManager.updateChat(2, history);
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
  Get a list of models from OpenRouter
*/
async function getModels() {
  const url = "https://openrouter.ai/api/v1/models";
  try {
    const response = await fetch(url, {
      method: "GET",
    });

    //get model data
    const data = await response.json();
    const models = data.data
      .map((m) => {
        return { id: m.id, name: m.name };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    //push to App
    window.app.updateState("models", models);
  } catch (error) {
    console.error(error.message);
  }
}
