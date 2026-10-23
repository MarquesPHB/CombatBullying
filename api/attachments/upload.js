const { del, head } = require("@vercel/blob");
const { handleUpload } = require("@vercel/blob/client");

function siteOrigin(request) {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const protocol = request.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${request.headers.host}`;
}

async function postToApi(request, path, body, headers = {}) {
  const requestHeaders = { "Content-Type": "application/json", ...headers };
  if (request.headers.cookie) requestHeaders.cookie = request.headers.cookie;
  const response = await fetch(`${siteOrigin(request)}${path}`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Não foi possível processar o anexo.");
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
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let payload;
        try {
          payload = JSON.parse(tokenPayload || "{}");
          const metadata = await head(blob.pathname, { access: "private" });
          await postToApi(
            request,
            "/api/attachments/complete",
            {
              attachment_id: payload.attachment_id,
              pathname: blob.pathname,
              url: blob.url,
              content_type: blob.contentType,
              file_size: metadata.size,
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
