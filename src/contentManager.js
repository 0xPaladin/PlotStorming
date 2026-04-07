// Configure localforage
export const DB = localforage.createInstance({
  name: "PlotStorming",
  storeName: "content",
  description: "user content",
});

export class ContentManager {
  constructor(app) {
    this.app = app;

    this.data = [];

    //data keys
    this.dataKeys = ["id", "folder", "name", "text"];

    this.poll();
    //poll every 5 seconds
    setInterval(() => this.poll(), 5000);
  }

  get all() {
    return this.data;
  }

  //add a new piece of content
  add(opts = {}) {
    const id = "content-" + Date.now();
    const content = {
      id: id,
      folder: opts.folder || null,
      name: opts.model ? "Chat Log" : "New Content",
      text:
        opts.text || opts.history
          ? opts.history.map((h) => `Role: ${h[0]}\n${h[1]}\n\n---\n\n`).join("")
          : "",
    };
    this.data.push(content);
    DB.setItem(id, content);
    //select new content
    this.app.setSelected("activeContent", id);
  }

  //update character from UI
  update(id, key, val) {
    const data = this.data.find((d) => d.id === id);
    //check for data
    if (data) {
      data[key] = val;

      this.save();
    }
  }

  poll() {
    return DB.iterate((data, key, iterationNumber) => {
      //check if exists
      if (this.data.find((d) => d.id === key)) {
        return;
      }
      this.data.push(data);
    });
  }

  //save
  save() {
    this.data.forEach((d) => DB.setItem(d.id, d));
  }

  //handle data delete
  delete(id) {
    this.data = this.data.filter((d) => d.id !== id);
    DB.removeItem(id);
    this.app.refresh();
  }

  /*
  UI Components
  */
  render(content) {
    const { html } = this.app;
    const { id, name, text } = content;
    const showMD = this.app.state.selected.get("showMD");

    return html`<div class="container bg-white-50 h-100 pa2">
      <div class="flex align-center mb2">
        <input
          type="text"
          class="f3 w-100"
          value=${name}
          onInput=${(e) => this.update(id, "name", e.target.value)}
        />
        <button
          class="btn-delete pa1"
          onClick=${() =>
            this.delete(id, this.app.setSelected("activeContent", null))}
        >
          🗑
        </button>
      </div>
      <div class="${showMD ? "dn" : "relative"}" style="flex:1;overflow-y: auto;">
        <span
          class="pointer dim bg-light-gray ba br2 b--black pa2 f4 absolute top-0 right-0"
          onClick=${() => this.app.setSelected("showMD", true)}
          >📃</span
        >
        <textarea
          class="w-100 h-100"
          value=${text}
          onInput=${(e) => this.update(id, "text", e.target.value)}
        >
        </textarea>
      </div>
      <div class="${showMD ? "relative" : "dn"}" style="flex:1;overflow-y: auto;">
        <span
          class="pointer btn-secondary absolute top-0 right-0"
          onClick=${() => this.app.setSelected("showMD", false)}
          >📝</span
        >
        <div id="md-${id}" class="markdown ph2"></div>
      </div>
      <div class="h1">  </div>
    </div>`;
  }
}
