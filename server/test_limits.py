import unittest

from server.limits import InMemoryRateLimiter


class RateLimiterTests(unittest.TestCase):
    def test_allows_up_to_limit(self):
        limiter = InMemoryRateLimiter(limit=2, window_seconds=60)
        self.assertTrue(limiter.allow("client"))
        self.assertTrue(limiter.allow("client"))
        self.assertFalse(limiter.allow("client"))

    def test_keys_are_isolated(self):
        limiter = InMemoryRateLimiter(limit=1, window_seconds=60)
        self.assertTrue(limiter.allow("a"))
        self.assertFalse(limiter.allow("a"))
        self.assertTrue(limiter.allow("b"))


if __name__ == "__main__":
    unittest.main()
