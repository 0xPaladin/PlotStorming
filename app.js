/*
  UI Resources  
*/
//Preact & HTM
import {
  html,
  Component,
  render,
} from "https://unpkg.com/htm/preact/standalone.module.js";

//marked for markdown rendering
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

//pull manager class as template
import { ContentManager } from "./src/contentManager.js";

//user manager
import { UserManager } from "./src/userManager.js";

/*
  Declare the main App 
*/
class App extends Component {
  constructor() {
    super();
    this.state = {
      tick: 0,
      models: [],
      show: null,
      selected: new Map([["leftColumn", null]]),
      payload: new Set(),
      draggedContent: null, // Track dragged content
    };

    /* pull last access from local storage */
    const lastAccess = localStorage.getItem("lastAccess") || null;
    console.log("Last Access: " + lastAccess);
    localStorage.setItem("lastAccess", Date.now());

    this.ContentManager = new ContentManager(this);
    this.ContentManager = this.ContentManager;

    this.UserManager = new UserManager(this);
    this.UserManager = this.UserManager;

    //save to main APP
    window.app = this;
    app.html = html;
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    console.log("UI Mounted");

    //timer
    let tick = 0;
    setInterval(async () => {
      tick++;

      if (tick % 5) {
      }
    }, 1000);

    enableResize();
  }

  // Lifecycle: After render
  componentDidUpdate(prevProps, prevState, snapshot) {
    //check for markdown
    if (this.state.selected.get("showMD")) {
      const content = this.ContentManager.all.find(
        (c) => c.id === this.state.selected.get("activeContent"),
      );
      const el = document.getElementById("md-" + content.id);
      el.innerHTML = marked.parse(content.text);
    }
  }

  /*
  Open Router Prompt
  */

  sendPrompt() {
    const CM = this.ContentManager;
    const UM = this.UserManager;

    //create message payload - start with attached data
    const payload = [...this.state.payload.values()].map((id) => {
      const content = CM.all.find((c) => c.id === id);
      return {
        role: "user",
        content: content.text,
      };
    });

    const { history, prompt } = UM.activeChat;

    //add to history - and update
    history.push(
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: "",
      },
    );
    UM.updateChat(2, history);
    UM.updateChat(1, "");

    //add chat history
    payload.push(...history);

    //send to Open Router
    UM.sendPrompt(payload, null, null);
  }

  /* 
   Drag and Drop handlers
  */
  onContentDragStart(content, e) {
    this.state.draggedContent = content;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", content.id);
  }

  onContentDragEnd(e) {
    this.state.draggedContent = null;
  }

  onFolderDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  onContentDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  onFolderDrop(folderName, e) {
    e.preventDefault();
    const content = this.state.draggedContent;
    if (content) {
      // Update content folder
      content.folder = folderName;
      this.ContentManager.save();
      this.refresh();
      this.notify({
        title: "Moved",
        message: `${content.name} moved to ${folderName}`,
        color: "green",
        timeout: 2000,
      });
    }
  }

  onNoFolderDrop(e) {
    e.preventDefault();
    const content = this.state.draggedContent;
    if (content) {
      // Remove content from folder
      content.folder = null;
      this.ContentManager.save();
      this.refresh();
      this.notify({
        title: "Moved",
        message: `${content.name} removed from folder`,
        color: "green",
        timeout: 2000,
      });
    }
  }

  /*
  Helper
  */

  // capitalizes first character of a string
  capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }

  /*
  Render functions 
*/
  //refresh UI
  refresh() {
    this.updateState("show", this.state.show);
  }

  notify(opts = {}) {
    opts.position = opts.position || "center";
    iziToast.show(opts);
  }

  //main function for updating state
  async updateState(what, val = "") {
    let s = {};
    s[what] = val;
    await this.setState(s);
  }

  setSelected(what, val) {
    this.state.selected.set(what, val);
    this.updateState("selected", this.state.selected);
  }

  set show(what) {
    this.updateState("show", what);
  }

  //main page render
  render({}, { show, selected, payload }) {
    //get content manager
    const CM = this.ContentManager;
    const content = CM.all.find((c) => c.id === selected.get("activeContent"));

    //get user manager
    const UM = this.UserManager;

    //build folders
    const folders = {};
    UM.folders.forEach((f) => {
      folders[f] = {
        name: f,
        show: selected.get("folder-" + f),
        content: CM.all.filter((c) => c.folder === f),
      };
    });
    const noFolderContent = CM.all.filter(
      (c) => !c.folder || !folders[c.folder],
    );
    //rename
    const toRename = selected.get("rename-folder");

    const contentItem = (c) =>
      html`<div
        class="flex"
        draggable="true"
        onDragStart=${(e) => this.onContentDragStart(c, e)}
        onDragEnd=${(e) => this.onContentDragEnd(e)}
        style="cursor: move; padding: 4px; border-radius: 4px; transition: background-color 0.2s;"
      >
        <input
          class="mr2"
          type="checkbox"
          value=${payload.has(c.id)}
          onClick=${() =>
            payload.has(c.id)
              ? this.state.payload.delete(c.id)
              : this.state.payload.add(c.id)}
        />
        <div
          class="pointer dim"
          onClick=${() => this.setSelected("activeContent", c.id)}
        >
          ${c.name}
        </div>
      </div>`;

    //left column
    const leftColumn = selected.get("leftColumn");

    //final layout
    return html`
      <div id="main" class="absolute z-1 top-0 left-0 w-100 h-100 flex">
        <!-- Left Bar -->
        <div class="flex z-1" style="max-width: 400px;">
          <div class="justify-center bg-white-30">
            <div
              class="pointer f4 pa2"
              onClick=${() => this.setSelected("leftColumn", "Content")}
            >
              ${leftColumn === "Content" ? "📂" : "📁"}
            </div>
            <div
              class="pointer f4 tc pa2"
              onClick=${() => this.setSelected("leftColumn", "Settings")}
            >
              ⚙️
            </div>
          </div>
          <div
            class="${leftColumn === "Settings" ? "mw5 pa1 bg-white-50" : "dn"}"
          >
            ${UM.render()}
          </div>
          <div class="${leftColumn === "Content" ? "pa1 bg-white-30" : "dn"}">
            <div class="flex" style="justify-content: flex-end;">
              <button
                class="bg-black-10 dim pointer"
                onClick=${() =>
                  UM.update("folders", [...UM.folders, "New Folder"])}
              >
                <img src="./assets/add-folder.svg" width="20" height="20" />
              </button>
            </div>
            <!-- Folders -->
            ${Object.keys(folders).map(
              (f) =>
                html`<div
                    class="b black w-100 mv1 flex items-center justify-between"
                    style="gap: 8px;"
                    onDragOver=${(e) => this.onFolderDragOver(e)}
                    onDrop=${(e) => this.onFolderDrop(f, e)}
                  >
                    <div class="flex items-center pointer dim">
                      <span
                        class="f4"
                        onClick=${() =>
                          this.setSelected(`folder-${f}`, !folders[f].show)}
                        >${folders[f].show ? "📂" : "📁"}</span
                      >
                      ${toRename === f
                        ? html`<input
                            type="text"
                            value=${f}
                            onBlur=${(e) => UM.renameFolder(f, e.target.value)}
                          />`
                        : html`<span
                            onClick=${() =>
                              this.setSelected(`folder-${f}`, !folders[f].show)}
                            >${f}</span
                          >`}
                    </div>
                    <div class="dropdown">
                      <div class="pointer dim ph2">⋮</div>
                      <div class="dropdown-content bg-light-gray">
                        <div href="#" onClick=${() => CM.add({ folder: f })}>
                          Add Content
                        </div>
                        <div
                          href="#"
                          class="mv1"
                          onClick=${() => this.setSelected("rename-folder", f)}
                        >
                          Rename
                        </div>
                        <div
                          href="#"
                          class="red"
                          onClick=${() => UM.deleteFolder(f)}
                        >
                          Delete
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="${folders[f].show ? "pa2" : "dn"}"
                    onDragOver=${(e) => this.onFolderDragOver(e)}
                    onDrop=${(e) => this.onFolderDrop(f, e)}
                  >
                    ${(folders[f].content || []).map((c) => contentItem(c))}
                  </div>`,
            )}
            <!-- No Folder -->
            <div
              class="b black w-100 mv1 flex items-center"
              style="gap: 8px;"
              onDragOver=${(e) => this.onContentDragOver(e)}
              onDrop=${(e) => this.onNoFolderDrop(e)}
            >
              <span class="f4">📄</span>
              <span>Uncategorized</span>
              <div class="dim pointer ph2" onClick=${() => CM.add()}>+</div>
            </div>
            <div
              class="pa2"
              onDragOver=${(e) => this.onContentDragOver(e)}
              onDrop=${(e) => this.onNoFolderDrop(e)}
            >
              ${noFolderContent.map((c) => contentItem(c))}
            </div>
          </div>
        </div>

        <!--Center-->
        <div id="center" class="w-100 bg-white-30 ma2">
          ${content ? CM.render(content) : ""}
        </div>

        <div id="resizer"></div>

        <!--Right-->
        <div id="right-bar" class="bg-white-30 pa2">
          <div class="w-100">
            <div class="section flex items-center">
              <span class="w-10" class="label b i black">Model</span>
              <select
                class="w-90"
                value=${UM.activeChat.model}
                onChange=${(e) => UM.updateChat(0, e.target.value)}
              >
                ${this.state.models.map(
                  (m) => html`<option value=${m.id}>${m.name}</option>`,
                )}
              </select>
            </div>
          </div>
          <div class="w-100 ba b--black mv1" style="flex:1;overflow-y: auto;">
            ${UM.activeChat.history.map(
              (txt) => html`<div class="br ba2 mv1">${txt}</div>`,
            )}
          </div>
          <div class="w-100">
            <div class="b i">Prompt</div>
            <textarea
              class="w-100"
              rows="6"
              value=${UM.activeChat.prompt}
              onInput=${(e) => UM.updateChat(1, e.target.value)}
            ></textarea>
            <div class="flex justify-between">
              <button class="btn-delete" onClick=${() => UM.updateChat(2, [])}>
                Clear
              </button>
              <button class="btn-green" onClick=${() => CM.add(UM.activeChat)}>
                Save All
              </button>
              <button class="btn-green" onClick=${() => this.sendPrompt()}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

const enableResize = () => {
  const resizer = document.querySelector("#resizer");
  const sidebar = document.querySelector("#right-bar");

  resizer.addEventListener("mousedown", (event) => {
    document.addEventListener("mousemove", resize, false);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resize, false);
      },
      false,
    );
  });

  function resize(e) {
    const width = window.innerWidth - e.x;
    const size = `${width > 600 ? 600 : width}px`;
    sidebar.style.flexBasis = size;
  }
};

// Render the app
render(html`<${App} />`, document.body);
