import unittest

from server.security import live_braket_enabled, public_https_url, safe_device_arn


class SecurityTests(unittest.TestCase):
    def test_valid_device_arn(self):
        self.assertTrue(safe_device_arn("arn:aws:braket:us-east-1::device/qpu/ionq/Forte-1"))

    def test_invalid_device_arn(self):
        self.assertFalse(safe_device_arn("not-an-arn"))
        self.assertFalse(safe_device_arn("arn:aws:braket:us-east-1::device/qpu/evil space"))

    def test_https_url(self):
        self.assertTrue(public_https_url("https://api.example.com/v1"))
        self.assertFalse(public_https_url("http://api.example.com/v1"))

    def test_live_braket_is_disabled_by_default(self):
        self.assertFalse(live_braket_enabled())


if __name__ == "__main__":
    unittest.main()
