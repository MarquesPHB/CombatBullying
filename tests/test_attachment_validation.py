import io
import zipfile
import unittest

from api.index import (
    attachment_content_error,
    attachment_metadata_error,
    resolve_assignment_update,
)


class AttachmentValidationTests(unittest.TestCase):
    def test_rejects_executable_and_script_extensions(self):
        for name, content_type in (
            ("payload.exe", "application/pdf"),
            ("payload.js", "text/plain"),
            ("payload.svg", "image/png"),
            ("payload.html", "text/plain"),
        ):
            with self.subTest(name=name):
                self.assertIsNotNone(attachment_metadata_error(name, content_type))

    def test_rejects_executable_bytes_disguised_as_pdf(self):
        self.assertIsNotNone(
            attachment_content_error("report.pdf", "application/pdf", b"MZ\x90\x00")
        )

    def test_rejects_mime_and_extension_mismatch(self):
        self.assertIsNotNone(
            attachment_content_error("report.png", "application/pdf", b"%PDF-1.7")
        )

    def test_accepts_supported_file_signatures(self):
        valid_files = (
            ("photo.jpg", "image/jpeg", b"\xff\xd8\xff\xe0"),
            ("photo.png", "image/png", b"\x89PNG\r\n\x1a\n"),
            ("report.pdf", "application/pdf", b"%PDF-1.7"),
            ("recording.wav", "audio/wav", b"RIFF\x00\x00\x00\x00WAVE"),
            ("notes.txt", "text/plain", "Relato seguro".encode()),
        )
        for name, content_type, content in valid_files:
            with self.subTest(name=name):
                self.assertIsNone(
                    attachment_content_error(name, content_type, content)
                )

    def test_accepts_a_real_docx_package_and_rejects_arbitrary_zip(self):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w") as document:
            document.writestr("[Content_Types].xml", "<Types/>")
            document.writestr("word/document.xml", "<document/>")
        self.assertIsNone(
            attachment_content_error(
                "report.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                buffer.getvalue(),
            )
        )

        invalid = io.BytesIO()
        with zipfile.ZipFile(invalid, "w") as archive:
            archive.writestr("payload.js", "alert(1)")
        self.assertIsNotNone(
            attachment_content_error(
                "report.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                invalid.getvalue(),
            )
        )


class ProtocolAssignmentTests(unittest.TestCase):
    def test_operator_can_keep_existing_assignment(self):
        self.assertEqual(
            resolve_assignment_update({"assigned_to": "12"}, 12, False),
            (False, None, None),
        )

    def test_operator_can_keep_unassigned_protocol_unassigned(self):
        self.assertEqual(
            resolve_assignment_update({"assigned_to": None}, None, False),
            (False, None, None),
        )

    def test_operator_cannot_change_assignment(self):
        changed, assigned, error = resolve_assignment_update(
            {"assigned_to": 13}, 12, False
        )
        self.assertFalse(changed)
        self.assertIsNone(assigned)
        self.assertIn("Somente o administrador", error)

    def test_admin_can_change_or_clear_assignment(self):
        self.assertEqual(
            resolve_assignment_update({"assigned_to": "13"}, 12, True),
            (True, 13, None),
        )
        self.assertEqual(
            resolve_assignment_update({"assigned_to": None}, 12, True),
            (True, None, None),
        )

    def test_invalid_assignment_is_rejected(self):
        changed, assigned, error = resolve_assignment_update(
            {"assigned_to": "not-an-id"}, 12, True
        )
        self.assertFalse(changed)
        self.assertIsNone(assigned)
        self.assertEqual(error, "Responsável inválido.")


if __name__ == "__main__":
    unittest.main()
