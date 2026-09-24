"""The service must finish active workers when the launcher sends SIGTERM."""
import signal
import unittest
from unittest.mock import patch

from ai import main as entrypoint
from ai.src.settings import Settings


class MainShutdownTests(unittest.TestCase):
    def test_sigterm_runs_cleanup_and_restores_handler(self):
        previous = signal.getsignal(signal.SIGTERM)

        def receive_term(**kwargs):
            signal.getsignal(signal.SIGTERM)(signal.SIGTERM, None)

        with patch.object(entrypoint, "load_settings", return_value=Settings()), \
                patch.object(entrypoint, "create_server") as server, \
                patch("sys.argv", ["main.py"]):
            server.return_value.start.side_effect = receive_term
            self.assertEqual(entrypoint.main(), 0)
            server.return_value.stop.assert_called_once()
        self.assertEqual(signal.getsignal(signal.SIGTERM), previous)

    def test_start_failure_returns_nonzero_and_cleans_up(self):
        previous = signal.getsignal(signal.SIGTERM)
        with patch.object(entrypoint, "load_settings", return_value=Settings()), \
                patch.object(entrypoint, "create_server") as server, \
                patch("sys.argv", ["main.py"]), self.assertLogs(level="ERROR"):
            server.return_value.start.side_effect = OSError("port busy")
            self.assertEqual(entrypoint.main(), 1)
            server.return_value.stop.assert_called_once()
        self.assertEqual(signal.getsignal(signal.SIGTERM), previous)


if __name__ == "__main__":
    unittest.main()
