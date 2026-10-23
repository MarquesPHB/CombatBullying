const { del, get, head } = require("@vercel/blob");
const { handleUpload } = require("@vercel/blob/client");

function isDocxPackage(content) {
  const eocdSignature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const eocdOffset = content.lastIndexOf(eocdSignature);
  if (eocdOffset < 0 || eocdOffset + 22 > content.length) return false;
  const commentLength = content.readUInt16LE(eocdOffset + 20);
  if (eocdOffset + 22 + commentLength !== content.length) return false;
  const entryCount = content.readUInt16LE(eocdOffset + 10);
  const directorySize = content.readUInt32LE(eocdOffset + 12);
  const directoryOffset = content.readUInt32LE(eocdOffset + 16);
  if (directoryOffset + directorySize > eocdOffset) return false;

  const names = new Set();
  let offset = directoryOffset;
  for (let entry = 0; entry < entryCount; entry += 1) {
    if (content.readUInt32LE(offset) !== 0x02014b50 || offset + 46 > content.length) {
      return false;
    }
    const nameLength = content.readUInt16LE(offset + 28);
    const extraLength = content.readUInt16LE(offset + 30);
    const commentSize = content.readUInt16LE(offset + 32);
    const end = offset + 46 + nameLength + extraLength + commentSize;
    if (end > content.length) return false;
    names.add(content.subarray(offset + 46, offset + 46 + nameLength).toString("utf8"));
    offset = end;
  }
  return names.has("[Content_Types].xml") && names.has("word/document.xml");
}

async function readContentPrefix(pathname, fullDocument = false) {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    throw new Error("Não foi possível validar o conteúdo do anexo.");
  }
  const reader = result.stream.getReader();
  const chunks = [];
  let length = 0;
  const maxBytes = fullDocument ? 25_000_000 : 8192;
  let streamDone = false;
  while (length < maxBytes) {
    const { value, done } = await reader.read();
    if (done) {
      streamDone = true;
      break;
    }
    const chunk = Buffer.from(value);
    const part = chunk.subarray(0, maxBytes - length);
    chunks.push(part);
    length += part.length;
  }
  if (fullDocument && length === maxBytes && !streamDone) {
    const next = await reader.read();
    if (!next.done) {
      await reader.cancel();
      throw new Error("O documento Word ultrapassa o limite permitido.");
    }
    streamDone = true;
  }
  if (!streamDone) await reader.cancel();
  if (!length) throw new Error("O arquivo enviado está vazio.");
  const content = Buffer.concat(chunks);
  if (fullDocument && !isDocxPackage(content)) {
    throw new Error("O arquivo não é um documento Word válido.");
  }
  return content.subarray(0, 8192).toString("base64");
}

function siteOrigin(request) {
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const protocol = request.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${request.headers.host}`;
}

function responseError(data, status) {
  if (typeof data?.error === "string" && data.error) return data.error;
  if (typeof data?.message === "string" && data.message) return data.message;
  const error = data?.error;
  const code = typeof error?.code === "string" ? error.code : null;
  const message = typeof error?.message === "string" ? error.message : null;
  if (message) return message;
  if (code) return `A API recusou a solicitação (${code}, HTTP ${status}).`;
  return `A API recusou a solicitação (HTTP ${status}).`;
}

async function postToApi(request, path, body, headers = {}) {
  const requestHeaders = { "Content-Type": "application/json", ...headers };
  if (request.headers.cookie) requestHeaders.cookie = request.headers.cookie;
  const response = await fetch(`${siteOrigin(request)}${path}`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  let data;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(responseError(data, response.status));
  }
  return data;
}

module.exports = async function uploadAttachment(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método não permitido." });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(503).json({
      error: "O armazenamento privado de anexos ainda não está configurado.",
    });
  }

  try {
    const result = await handleUpload({
      request,
      body: request.body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let details;
        try {
          details = JSON.parse(clientPayload || "{}");
        } catch {
          throw new Error("Os dados do anexo são inválidos.");
        }
        const reservation = await postToApi(request, "/api/attachments/reserve", {
          ...details,
          pathname,
        });
        return {
          addRandomSuffix: false,
          allowOverwrite: false,
          allowedContentTypes: [reservation.content_type],
          maximumSizeInBytes: reservation.max_size,
          tokenPayload: JSON.stringify({
            attachment_id: reservation.attachment_id,
            file_name: details.file_name,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let payload;
        try {
          payload = JSON.parse(tokenPayload || "{}");
          const metadata = await head(blob.pathname, { access: "private" });
          const contentPrefix = await readContentPrefix(
            blob.pathname,
            payload.file_name?.toLowerCase().endsWith(".docx"),
          );
          await postToApi(
            request,
            "/api/attachments/complete",
            {
              attachment_id: payload.attachment_id,
              pathname: blob.pathname,
              url: blob.url,
              content_type: blob.contentType,
              file_size: metadata.size,
              file_name: payload.file_name,
              content_prefix: contentPrefix,
              docx_valid: payload.file_name?.toLowerCase().endsWith(".docx") || undefined,
            },
            { "X-Blob-Internal-Token": process.env.BLOB_READ_WRITE_TOKEN },
          );
        } catch (error) {
          try {
            await del(blob.pathname, { access: "private" });
          } catch (cleanupError) {
            console.error("Não foi possível remover o anexo não associado.", cleanupError);
          }
          throw error;
        }
      },
    });
    return response.status(200).json(result);
  } catch (error) {
    console.error("Falha no upload privado de anexo.", error);
    return response.status(400).json({
      error: error instanceof Error
        ? error.message
        : "Não foi possível enviar o anexo.",
    });
  }
};
