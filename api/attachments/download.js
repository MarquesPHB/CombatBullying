const { Readable } = require("node:stream");
const { get } = require("@vercel/blob");

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

module.exports = async function downloadAttachment(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método não permitido." });
  }
  const attachmentId = Number(request.query?.id);
  if (!Number.isSafeInteger(attachmentId) || attachmentId < 1) {
    return response.status(400).json({ error: "Anexo inválido." });
  }

  try {
    const authorization = await fetch(
      `${siteOrigin(request)}/api/attachments/authorize-download/${attachmentId}`,
      { headers: { cookie: request.headers.cookie || "" } },
    );
    const authorizationData = await authorization.json();
    if (!authorization.ok) {
      return response.status(authorization.status).json(authorizationData);
    }

    const attachment = authorizationData.attachment;
    if (!attachment.blob_pathname) {
      return response.status(404).json({ error: "Anexo não encontrado no armazenamento privado." });
    }
    const result = await get(attachment.blob_pathname, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return response.status(404).json({ error: "Anexo não encontrado." });
    }
    const safeName = encodeURIComponent(attachment.file_name).replace(
      /['()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    response.setHeader("Content-Type", result.blob.contentType || attachment.content_type);
    response.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${safeName}`);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "private, no-store");
    return Readable.fromWeb(result.stream).pipe(response);
  } catch (error) {
    console.error("Falha ao baixar anexo privado.", error);
    return response.status(502).json({
      error: "Não foi possível recuperar o anexo.",
    });
  }
};
