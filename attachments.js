(() => {
  const form = document.getElementById("report-form");
  const fileInput = document.getElementById("report-files");
  const attachmentNote = document.querySelector(".attachment-box small.muted");
  const attachmentSummary = document.getElementById("attachment-summary");
  const submitButton = form?.querySelector('button[type="submit"]');
  const limits = {
    video: 1_000_000_000,
    audio: 100_000_000,
    image: 50_000_000,
    other: 25_000_000,
  };
  const acceptedTypes = new Set([
    "video/mp4", "video/webm", "video/quicktime", "video/x-matroska",
    "video/3gpp", "video/x-msvideo", "video/mpeg",
    "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/x-wav",
    "audio/webm", "audio/aac", "audio/flac", "audio/x-m4a", "audio/3gpp",
    "audio/midi", "audio/x-ms-wma",
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic",
    "image/heif", "image/avif", "image/bmp", "image/tiff",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf", "text/plain", "text/csv", "text/rtf",
  ]);
  let uploaderPromise;

  if (!form || !fileInput || !submitButton) return;

  if (attachmentNote) {
    attachmentNote.textContent =
      "Até 8 arquivos e 2 GB no total: vídeos de até 10 minutos e 1 GB por arquivo; áudios até 100 MB; imagens até 50 MB; documentos e textos até 25 MB. Os arquivos originais são enviados sem compressão.";
  }

  function showMessage(text, success = false) {
    const message = document.getElementById("report-message");
    message.replaceChildren();
    const alert = document.createElement("div");
    alert.className = `message ${success ? "success" : "error"}`;
    alert.textContent = text;
    message.appendChild(alert);
  }

  async function readJson(response) {
    const type = response.headers.get("content-type") || "";
    const raw = await response.text();
    let data = {};
    if (type.includes("application/json") && raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
      }
    }
    if (!response.ok) {
      throw new Error(data.error || `Não foi possível concluir (HTTP ${response.status}).`);
    }
    return data;
  }

  function getFileLimit(file) {
    if (!acceptedTypes.has(file.type)) {
      throw new Error(`O formato de “${file.name}” não é aceito. Selecione áudio, vídeo, imagem, PDF, Word ou texto.`);
    }
    if (file.type.startsWith("video/")) return limits.video;
    if (file.type.startsWith("audio/")) return limits.audio;
    if (file.type.startsWith("image/")) return limits.image;
    return limits.other;
  }

  function videoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);
      const timeout = setTimeout(() => finish(new Error(`Não foi possível verificar a duração de “${file.name}”.`)), 15_000);
      function finish(error, duration) {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute("src");
        video.load();
        if (error) reject(error);
        else resolve(duration);
      }
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          finish(new Error(`Não foi possível verificar a duração de “${file.name}”.`));
        } else if (video.duration > 10 * 60) {
          finish(new Error(`O vídeo “${file.name}” ultrapassa o limite de 10 minutos.`));
        } else {
          finish(null, video.duration);
        }
      };
      video.onerror = () => finish(new Error(`Não foi possível ler o vídeo “${file.name}”.`));
      video.src = objectUrl;
    });
  }

  async function validateFiles(files) {
    if (files.length > 8) throw new Error("Selecione no máximo 8 arquivos.");
    if (files.reduce((total, file) => total + file.size, 0) > 2_000_000_000) {
      throw new Error("O conjunto de anexos pode ter no máximo 2 GB.");
    }
    for (const file of files) {
      const limit = getFileLimit(file);
      if (file.size < 1 || file.size > limit) {
        throw new Error(`“${file.name}” excede o limite de ${(limit / 1_000_000).toLocaleString("pt-BR")} MB.`);
      }
      if (file.type.startsWith("video/")) await videoDuration(file);
    }
  }

  async function getUploader() {
    if (!uploaderPromise) {
      uploaderPromise = import("https://esm.sh/@vercel/blob@2.8.2/client")
        .then((module) => {
          if (typeof module.upload !== "function") {
            throw new Error("O SDK de anexos não está disponível.");
          }
          return module.upload;
        })
        .catch(() => {
          uploaderPromise = null;
          throw new Error("Não foi possível carregar o serviço seguro de anexos. Verifique sua conexão e tente novamente.");
        });
    }
    return uploaderPromise;
  }

  async function checkStorage() {
    await readJson(await fetch("/api/attachments/status", { headers: { Accept: "application/json" } }));
  }

  async function cancelReservation(credentials, pathname) {
    try {
      await fetch("/api/attachments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...credentials, pathname }),
      });
    } catch (error) {
      console.error("Não foi possível cancelar a reserva do anexo.", error);
    }
  }

  async function uploadFiles(files, credentials, upload, status) {
    const failed = [];
    const pathCode = credentials.code.replace(/[^A-Za-z0-9_-]/g, "");
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = file.name.includes(".")
        ? `.${file.name.split(".").pop().replace(/[^A-Za-z0-9]/g, "").toLowerCase()}`
        : "";
      const pathname = `evidence/${pathCode}/${crypto.randomUUID()}${extension}`;
      status.textContent = `Enviando anexo ${index + 1} de ${files.length}: ${file.name}`;
      try {
        await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/attachments/upload",
          clientPayload: JSON.stringify({
            ...credentials,
            file_name: file.name,
            content_type: file.type,
            file_size: file.size,
          }),
        });
      } catch (error) {
        await cancelReservation(credentials, pathname);
        failed.push(file);
        console.error(`Falha no envio do anexo “${file.name}”.`, error);
      }
    }
    return failed;
  }

  function createReceipt(credentials) {
    const message = document.getElementById("report-message");
    message.replaceChildren();
    const success = document.createElement("div");
    success.className = "message success";
    success.textContent = "Relato recebido com segurança. Guarde os dados de acesso abaixo.";
    const receipt = document.createElement("div");
    receipt.className = "card";
    receipt.setAttribute("aria-live", "polite");
    receipt.innerHTML =
      "<h3>Guarde seus dados de acesso</h3><p class=\"muted\">O protocolo e o PIN são necessários para consultar o andamento. O PIN será exibido somente agora; anote-o em local seguro.</p><p><b>Protocolo:</b> <code data-receipt-code></code></p><p><b>PIN:</b> <code data-receipt-pin></code></p><div class=\"actions\"><button type=\"button\" class=\"secondary\" data-copy-receipt>Copiar protocolo e PIN</button><button type=\"button\" class=\"primary\" data-track-receipt>Acompanhar protocolo</button></div><div class=\"message\" data-upload-status aria-live=\"polite\"></div>";
    receipt.querySelector("[data-receipt-code]").textContent = credentials.code;
    receipt.querySelector("[data-receipt-pin]").textContent = credentials.pin;
    receipt.querySelector("[data-copy-receipt]").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`Protocolo: ${credentials.code}\nPIN: ${credentials.pin}`);
        receipt.querySelector("[data-upload-status]").textContent = "Protocolo e PIN copiados.";
      } catch {
        receipt.querySelector("[data-upload-status]").textContent = "Não foi possível copiar. Anote os dados exibidos.";
      }
    });
    receipt.querySelector("[data-track-receipt]").addEventListener("click", () => {
      document.getElementById("track-code").value = credentials.code;
      document.getElementById("track-pin").value = credentials.pin;
      window.go("protocol");
    });
    message.append(success, receipt);
    return receipt;
  }

  async function handleSubmit() {
    if (form.dataset.protocolCreated === "true") return;
    const description = document.getElementById("report-description").value.trim();
    const date = document.getElementById("report-date").value;
    const time = document.getElementById("report-time").value;
    const type = document.querySelector("#report-types .active")?.textContent.trim();
    const files = [...fileInput.files];
    if (!description || !date || !time || !type) {
      showMessage("Informe o tipo de agressão, o relato, a data e a hora do ocorrido.");
      return;
    }
    if (privacy === "identified" &&
        !document.getElementById("report-email").value.trim() &&
        !document.getElementById("report-phone").value.trim()) {
      showMessage("Informe e-mail ou telefone/WhatsApp para receber atualizações.");
      return;
    }

    submitButton.disabled = true;
    let protocolCreated = false;
    let receipt = null;
    try {
      await validateFiles(files);
      if (files.length) {
        await checkStorage();
        await getUploader();
      }
      showMessage("Enviando relato...", true);
      const response = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          aggression_type: type,
          occurred_date: date,
          occurred_time: time,
          location: document.getElementById("report-location").value,
          class_series: document.getElementById("report-class").value.trim(),
          report: description,
          privacy,
          role,
          reporter_name: privacy === "identified" ? document.getElementById("report-name").value : "",
          reporter_email: privacy === "identified" ? document.getElementById("report-email").value : "",
          reporter_phone: privacy === "identified" ? document.getElementById("report-phone").value : "",
          attachments: [],
        }),
      });
      const data = await readJson(response);
      if (!data.protocol || !data.pin) {
        throw new Error("O servidor não confirmou a criação segura do protocolo e PIN.");
      }
      protocolCreated = true;
      form.dataset.protocolCreated = "true";
      const credentials = { code: data.protocol, pin: data.pin };
      receipt = createReceipt(credentials);
      const uploadStatus = receipt.querySelector("[data-upload-status]");
      let failedCount = 0;

      if (files.length) {
        const upload = await getUploader();
        let failedFiles = await uploadFiles(files, credentials, upload, uploadStatus);
        failedCount = failedFiles.length;
        if (failedFiles.length) {
          uploadStatus.className = "message error";
          uploadStatus.textContent = `${failedFiles.length} anexo(s) não puderam ser enviados. Você pode tentar novamente.`;
          const retry = document.createElement("button");
          retry.type = "button";
          retry.className = "secondary";
          retry.textContent = "Tentar enviar anexos novamente";
          retry.addEventListener("click", async () => {
            retry.disabled = true;
            retry.textContent = "Enviando...";
            const stillFailed = await uploadFiles(failedFiles, credentials, upload, uploadStatus);
            failedFiles = stillFailed;
            if (stillFailed.length) {
              failedCount = stillFailed.length;
              uploadStatus.className = "message error";
              uploadStatus.textContent = `${stillFailed.length} anexo(s) ainda não puderam ser enviados.`;
              retry.disabled = false;
              retry.textContent = "Tentar enviar anexos novamente";
            } else {
              failedCount = 0;
              attachmentSummary.textContent = `${files.length} arquivo(s) enviado(s)`;
              uploadStatus.className = "message success";
              uploadStatus.textContent = "Todos os anexos foram enviados com segurança.";
              retry.remove();
            }
          });
          receipt.appendChild(retry);
        } else {
          uploadStatus.className = "message success";
          uploadStatus.textContent = "Todos os anexos foram enviados com segurança.";
        }
      } else {
        uploadStatus.className = "message";
        uploadStatus.textContent = "";
      }
      submitButton.textContent = "Relato enviado";
      attachmentSummary.textContent = files.length
        ? `${files.length - failedCount} de ${files.length} arquivo(s) enviado(s)`
        : "Nenhum arquivo selecionado";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar o relato.";
      const uploadStatus = receipt?.querySelector("[data-upload-status]");
      if (protocolCreated && uploadStatus) {
        uploadStatus.className = "message error";
        uploadStatus.textContent = `Relato criado. ${errorMessage}`;
      } else {
        showMessage(errorMessage);
      }
    } finally {
      if (!protocolCreated) submitButton.disabled = false;
    }
  }

  document.addEventListener("submit", (event) => {
    if (event.target !== form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    handleSubmit().catch((error) => {
      submitButton.disabled = false;
      showMessage(error instanceof Error ? error.message : "Não foi possível enviar o relato.");
    });
  }, true);
})();
