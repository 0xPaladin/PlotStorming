import { parse, stringify } from "https://cdn.jsdelivr.net/npm/yaml@2.8.3/+esm";

export class MapsManager {
    constructor(app) {
        this.app = app;
        this.draggingContainer = null;
        this.dragStart = { x: 0, y: 0 };
        this.containerStart = { x: 0, y: 0 };
    }

    //handle image upload
    async handleImageUpload(contentId, file) {
        if (!file || !file.type.startsWith('image/')) {
            this.app.notify({
                title: "Invalid File",
                message: "Please select an image file",
                color: "yellow",
            });
            return;
        }

        try {
            // Store blob in ContentManager
            this.app.ContentManager.update(contentId, "imageBlob", file);
            this.app.notify({
                title: "Image Uploaded",
                message: "Background image updated",
                color: "green",
                timeout: 2000,
            });
            this.app.refresh();
        } catch (e) {
            this.app.notify({
                title: "Upload Error",
                message: e.toString(),
                color: "red",
            });
        }
    }

    //create object URL from blob for rendering
    getBlobUrl(blob) {
        if (!blob) return null;
        try {
            // If blob is already a File object, use it directly
            if (blob instanceof File || blob instanceof Blob) {
                return URL.createObjectURL(blob);
            }
            return null;
        } catch (e) {
            console.error("Error creating blob URL:", e);
            return null;
        }
    }

    //parse map YAML and return containers
    parseMapsYAML(text) {
        try {
            const parsed = parse(text);
            return {
                containers: parsed.containers || []
            };
        } catch (e) {
            console.error("Error parsing map YAML:", e);
            return { containers: [] };
        }
    }

    //update container position in YAML
    updateContainerPosition(contentId, containerId, x, y) {
        const content = this.app.ContentManager.all.find((c) => c.id === contentId);
        if (!content) return;

        try {
            // Parse the YAML
            const parsed = parse(content.text);

            // Find and update the container
            if (parsed.containers) {
                const container = parsed.containers.find(c => c.id === containerId);
                if (container) {
                    container.x = Math.round(x);
                    container.y = Math.round(y);

                    // Convert back to YAML and update
                    const updatedYaml = stringify(parsed);
                    this.app.ContentManager.update(contentId, "text", updatedYaml);
                }
            }
        } catch (e) {
            console.error("Error updating container position:", e);
            this.app.notify({
                title: "Update Error",
                message: e.toString(),
                color: "red",
            });
        }
    }

    //render the map editor (raw YAML + image upload)
    renderEditor(content) {
        const { html } = this.app;
        const { id, text, imageBlob } = content;
        const blobUrl = this.getBlobUrl(imageBlob);

        return html`
      <div class="relative" style="flex:1;overflow-y: auto;">
        <span
          class="pointer dim bg-light-gray ba br2 b--black pa2 f4 absolute top-0 right-0"
          style="z-index: 10;"
          onClick=${() => this.app.setSelected("showMap-" + id, true)}
          >🗺️</span
        >
        <div class="pa3">
          <div class="mv3">
            <label class="db b mb2">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange=${(e) =>
                this.handleImageUpload(id, e.target.files[0])}
            />
            ${blobUrl
                ? html`<div class="mt2">
                  <img
                    src=${blobUrl}
                    style="max-width: 200px; max-height: 150px; border-radius: 4px;"
                  />
                </div>`
                : html`<p class="mid-gray i mt2">No image selected</p>`}
          </div>
          <label class="db b mb2">Map YAML</label>
        </div>
        <textarea
          class="w-100"
          style="height: 400px;"
          value=${text}
          onInput=${(e) => this.app.ContentManager.update(id, "text", e.target.value)}
        >
        </textarea>
      </div>
    `;
    }

    //render the map view (background + draggable containers)
    renderMap(content) {
        const { html } = this.app;
        const { id, text, imageBlob } = content;

        // Parse containers from YAML
        const { containers } = this.parseMapsYAML(text);
        const blobUrl = this.getBlobUrl(imageBlob);
        const draggingId = this.app.state.selected.get("mapDraggingContainer");

        return html`
      <div class="relative" style="flex:1;overflow-y: auto;">
        <span
          class="pointer dim bg-light-gray ba br2 b--black pa2 f4 absolute top-0 right-0"
          style="z-index: 100;"
          onClick=${() => this.app.setSelected("showMap-" + id, false)}
          >📝</span
        >
        <div
          class="map-canvas relative"
          style="
            position: relative;
            width: 100%;
            min-height: 600px;
            ${blobUrl ? `background-image: url('${blobUrl}'); background-size: cover; background-position: center;` : ''}
            border: 2px solid #ccc;
            margin-top: 40px;
          "
        >
          ${containers.map(
            (container) => html`
              <div
                class="map-container ${draggingId === container.id ? 'dragging' : ''}"
                data-container-id=${container.id}
                style="
                  position: absolute;
                  left: ${container.x}px;
                  top: ${container.y}px;
                  width: ${container.width}px;
                  height: ${container.height}px;
                  cursor: grab;
                  user-select: none;
                  transition: ${draggingId === container.id ? 'none' : 'box-shadow 0.2s'};
                "
                onMouseDown=${(e) => this.startDrag(e, id, container.id, container.x, container.y)}
              >
                <div class="ph2 pv1 f6 b">${container.label || container.id}</div>
                <div class="ph2 pv1 f7" style="overflow-y: auto; height: calc(100% - 28px);">
                  ${container.text}
                </div>
              </div>
            `,
        )}
        </div>
      </div>
    `;
    }

    //start dragging a container
    startDrag(e, contentId, containerId, startX, startY) {
        e.preventDefault();
        this.draggingContainer = { contentId, containerId };
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.containerStart = { x: startX, y: startY };

        this.app.setSelected("mapDraggingContainer", containerId);

        // Add global mouse listeners
        const handleMouseMove = (moveEvent) => this.onDragMove(moveEvent);
        const handleMouseUp = (upEvent) => this.onDragEnd(upEvent, handleMouseMove, handleMouseUp);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    //handle drag movement
    onDragMove(e) {
        if (!this.draggingContainer) return;

        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;

        const newX = this.containerStart.x + deltaX;
        const newY = this.containerStart.y + deltaY;

        // Update DOM position immediately for smooth dragging
        const element = document.querySelector(`[data-container-id="${this.draggingContainer.containerId}"]`);
        if (element) {
            element.style.left = newX + "px";
            element.style.top = newY + "px";
        }
    }

    //end drag and update YAML
    onDragEnd(e, moveHandler, upHandler) {
        if (!this.draggingContainer) return;

        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);

        // Calculate final position
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        const finalX = this.containerStart.x + deltaX;
        const finalY = this.containerStart.y + deltaY;

        // Update YAML with new position
        this.updateContainerPosition(
            this.draggingContainer.contentId,
            this.draggingContainer.containerId,
            finalX,
            finalY
        );

        this.app.setSelected("mapDraggingContainer", null);
        this.draggingContainer = null;
        this.app.refresh();
    }

    render(content) {
        const { html } = this.app;
        const showMap = this.app.state.selected.get("showMap-" + content.id);

        return html`
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
        ${showMap ? this.renderMap(content) : this.renderEditor(content)}
      </div>
    `;
    }
}