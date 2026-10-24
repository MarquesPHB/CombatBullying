import unittest
from unittest.mock import patch

from api.index import app


class QueryResult:
    def __init__(self, row=None):
        self.row = row

    def fetchone(self):
        return self.row


class FakeConnection:
    def __init__(self, user_row=None, active_admin_count=2):
        self.user_row = user_row
        self.active_admin_count = active_admin_count
        self.statements = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def execute(self, query, params=None):
        self.statements.append((query, params))
        if "SELECT id, role, active FROM users" in query:
            return QueryResult(self.user_row)
        if "SELECT COUNT(*) AS count FROM users" in query:
            return QueryResult({"count": self.active_admin_count})
        return QueryResult()


class UserAdminApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.admin = {"id": 1, "username": "admin", "role": "admin"}

    def test_remove_user_revokes_access_without_deleting_history(self):
        connection = FakeConnection(
            user_row={"id": 2, "role": "operator", "active": True}
        )
        with (
            patch("api.index.current_user", return_value=self.admin),
            patch("api.index.db", return_value=connection),
        ):
            response = self.client.delete("/api/users/2")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            any("UPDATE users SET active = FALSE" in query for query, _ in connection.statements)
        )
        self.assertIn("histórico foi preservado", response.get_json()["message"])

    def test_admin_cannot_remove_themselves(self):
        with (
            patch("api.index.current_user", return_value=self.admin),
            patch("api.index.db") as database,
        ):
            response = self.client.delete("/api/users/1")

        self.assertEqual(response.status_code, 400)
        database.assert_not_called()

    def test_cannot_remove_the_last_active_admin(self):
        connection = FakeConnection(
            user_row={"id": 2, "role": "admin", "active": True},
            active_admin_count=1,
        )
        with (
            patch("api.index.current_user", return_value=self.admin),
            patch("api.index.db", return_value=connection),
        ):
            response = self.client.delete("/api/users/2")

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            any("UPDATE users SET active = FALSE" in query for query, _ in connection.statements)
        )

    def test_edit_updates_user_profile(self):
        connection = FakeConnection(
            user_row={"id": 2, "role": "operator", "active": True}
        )
        with (
            patch("api.index.current_user", return_value=self.admin),
            patch("api.index.db", return_value=connection),
        ):
            response = self.client.patch(
                "/api/users/2",
                json={
                    "display_name": "Nome atualizado",
                    "username": "novo_usuario",
                    "role": "admin",
                },
            )

        self.assertEqual(response.status_code, 200)
        update = next(
            (query, params)
            for query, params in connection.statements
            if "UPDATE users" in query
        )
        self.assertIn("SET username = %s, display_name = %s, role = %s", update[0])
        self.assertEqual(update[1], ("novo_usuario", "Nome atualizado", "admin", 2))


if __name__ == "__main__":
    unittest.main()
