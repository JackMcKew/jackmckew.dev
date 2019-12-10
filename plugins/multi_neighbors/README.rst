Multi Neighbors Plugin for Pelican
==================================

This `Pelican <https://getpelican.com>`_ plugin adds the ``next_articles`` (a
list of newer articles) and ``prev_articles`` (a list of older articles)
variables to every article's context.


Usage
-----

To install this plugin, see `How to use plugins
<http://docs.getpelican.com/en/latest/plugins.html>`__ from the Pelican
documentation.

By default, up to 5 neighbors are listed in each direction. You may customize
this value by defining ``MULTI_NEIGHBORS`` in your settings file, e.g.::

    MULTI_NEIGHBORS = 3

The code to output the variables in your article template might look like the
following:

.. code-block:: html+jinja

    {% if article.prev_articles %}
        <nav class="older">
            <h1>Previous articles</h1>
            <ul>
                {% for article in article.prev_articles %}
                    <li>
                        <a href="{{ SITEURL }}/{{ article.url }}">
                            {{ article.title }}
                        </a>
                    </li>
                {% endfor %}
            </ul>
        </nav>
    {% endif %}
    {% if article.next_articles %}
        <nav class="newer">
            <h1>Next articles</h1>
            <ul>
                {% for article in article.next_articles %}
                    <li>
                        <a href="{{ SITEURL }}/{{ article.url }}">
                            {{ article.title }}
                        </a>
                    </li>
                {% endfor %}
            </ul>
        </nav>
    {% endif %}


Running the tests
-----------------

Tests use the `unittest <https://docs.python.org/3/library/unittest.html>`__
framework and may be run with the following command::

    python -m unittest -v test_multi_neighbors
