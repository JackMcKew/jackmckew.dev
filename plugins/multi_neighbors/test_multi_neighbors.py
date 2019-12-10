import unittest

import multi_neighbors


class PseudoArticlesGenerator():

    def __init__(self, settings=None, articles=None):
        self.settings = settings or {}
        self.articles = articles or []


class PseudoArticle():

    def __init__(self, title=''):
        self.title = title

    def __repr__(self):
        return f'{self.__class__.__name__}({self.title})'


class NeighborsTestCase(unittest.TestCase):

    def setUp(self):
        self.generator = PseudoArticlesGenerator(
            settings={'MULTI_NEIGHBORS': 3},
            articles=[
                PseudoArticle('article6-newest'),  # List position 0.
                PseudoArticle('article5'),         # List position 1.
                PseudoArticle('article4'),         # List position 2.
                PseudoArticle('article3'),         # List position 3.
                PseudoArticle('article2'),         # List position 4.
                PseudoArticle('article1'),         # List position 5.
                PseudoArticle('article0-oldest'),  # List position 6.
            ])
        multi_neighbors.neighbors(self.generator)

    def test_prev_next(self):
        # Test prev articles.
        self.assertTrue(self.generator.articles[0].prev_articles ==
            [self.generator.articles[1], self.generator.articles[2], self.generator.articles[3]])
        self.assertTrue(self.generator.articles[1].prev_articles ==
            [self.generator.articles[2], self.generator.articles[3], self.generator.articles[4]])
        self.assertTrue(self.generator.articles[2].prev_articles ==
            [self.generator.articles[3], self.generator.articles[4], self.generator.articles[5]])
        self.assertTrue(self.generator.articles[3].prev_articles ==
            [self.generator.articles[4], self.generator.articles[5], self.generator.articles[6]])
        self.assertTrue(self.generator.articles[4].prev_articles ==
            [self.generator.articles[5], self.generator.articles[6]])
        self.assertTrue(self.generator.articles[5].prev_articles ==
            [self.generator.articles[6]])
        self.assertFalse(self.generator.articles[6].prev_articles)
        # Test next articles.
        self.assertFalse(self.generator.articles[0].next_articles)
        self.assertTrue(self.generator.articles[1].next_articles ==
            [self.generator.articles[0]])
        self.assertTrue(self.generator.articles[2].next_articles ==
            [self.generator.articles[1], self.generator.articles[0]])
        self.assertTrue(self.generator.articles[3].next_articles ==
            [self.generator.articles[2], self.generator.articles[1], self.generator.articles[0]])
        self.assertTrue(self.generator.articles[4].next_articles ==
            [self.generator.articles[3], self.generator.articles[2], self.generator.articles[1]])
        self.assertTrue(self.generator.articles[5].next_articles ==
            [self.generator.articles[4], self.generator.articles[3], self.generator.articles[2]])
        self.assertTrue(self.generator.articles[6].next_articles ==
            [self.generator.articles[5], self.generator.articles[4], self.generator.articles[3]])


if __name__ == '__main__':
    unittest.main()
