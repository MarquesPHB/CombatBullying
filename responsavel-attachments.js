(() => {
  const list = document.getElementById("list");
  if (!list) return;

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-open]");
    if (!button) return;
    const protocolId = button.dataset.open;
    const panel = document.getElementById(`treatment-${protocolId}`);
    if (!panel || panel.dataset.attachmentsLoaded) return;
    panel.dataset.attachmentsLoaded = "loading";
    try {
      const response = await fetch("/api/my-protocols", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os anexos.");
      const protocol = data.protocols.find((item) => String(item.id) === protocolId);
      const section = document.createElement("section");
      section.className = "card";
      const title = document.createElement("b");
      title.textContent = "Evidências anexadas";
      section.appendChild(title);
      if (protocol?.attachments?.length) {
        const items = document.createElement("ul");
        for (const file of protocol.attachments) {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = `/api/protocols/${protocol.id}/attachments/${file.id}`;
          link.textContent = `${file.file_name} (${(file.file_size / 1024 / 1024).toFixed(2)} MB)`;
          item.appendChild(link);
          items.appendChild(item);
        }
        section.appendChild(items);
      } else {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "Nenhuma evidência anexada.";
        section.appendChild(empty);
      }
      panel.querySelector("label")?.before(section);
      panel.dataset.attachmentsLoaded = "true";
    } catch (error) {
      delete panel.dataset.attachmentsLoaded;
      const message = document.createElement("p");
      message.className = "error";
      message.textContent = error instanceof Error ? error.message : "Não foi possível carregar os anexos.";
      panel.prepend(message);
    }
  });
})();
