module.exports = function attachmentStatus(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Método não permitido." });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return response.status(503).json({
      error: "O armazenamento privado de anexos ainda não está configurado.",
    });
  }
  return response.status(200).json({ available: true });
};
