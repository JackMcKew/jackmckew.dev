"""
Multi Neighbors plugin for Pelican.

This plugin adds the ``next_articles`` (newer) and ``prev_articles`` (older)
variables to every article's context.
"""

from pelican import signals


def neighbors(generator):
    n = generator.settings.get('MULTI_NEIGHBORS', 5)
    for i, article in enumerate(generator.articles):
        article.prev_articles = generator.articles[min(i+1, len(generator.articles)):i+1+n]
        article.next_articles = list(reversed(generator.articles[max(0,i-n):i]))

def register():
    signals.article_generator_finalized.connect(neighbors)
