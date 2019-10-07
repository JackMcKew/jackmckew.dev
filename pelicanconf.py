#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

RELATIVE_URLS = False
AUTHOR = "Jack McKew"
SITENAME = "Jack McKew's Blog"
SITETITLE = SITENAME
SITESUBTITLE = "Python enthusiast, electrical engineer and tinkerer"
SITEURL = "https://nifty-engelbart-ce3324.netlify.com"
SITELOGO = "img/jm-photo"

DISPLAY_PAGES_ON_MENU = True


ARTICLE_URL = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/'
ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/index.html'
YEAR_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/index.html'
MONTH_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/index.html'
DAY_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/index.html' 

THEME = "Flex"
STATIC_PATHS = ["img", "static"]
FAVICON = "img/favicon.ico"
CUSTOM_CSS = "static/custom.css"

USE_FOLDER_AS_CATEGORY = False
MAIN_MENU = True
HOME_HIDE_TAGS = False

MENUITEMS = (
    ("Archives", "/archives.html"),
    # ("Categories", "/categories.html"),
    ("Tags", "/tags.html"),
    ("Sitemap", "/sitemap.xml"),
)

SITEMAP = {
    "format": "xml",
    "priorities": {"articles": 0.6, "indexes": 0.6, "pages": 0.5},
    "changefreqs": {"articles": "monthly", "indexes": "daily", "pages": "monthly"},
}

PLUGIN_PATHS = [
    "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins",
    "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins\\pelican_youtube",
]

PLUGINS = [
    "sitemap",
    "better_codeblock_line_numbering",
    "better_code_samples",
    "deadlinks",
    "glossary",
    "multi_neighbors",
    "pelican_youtube",
    "photos",
    "representative_image",
    "share_post",
    "always_modified",
    "dateish",
    "readtime"
]


DELETE_OUTPUT_DIRECTORY = False
STATIC_PATHS = ["img", "static", "pdf"]
PATH = "content"
# ARTICLE_PATHS = ['blog']
# ARTICLE_SAVE_AS = '{date:%Y}/{slug}.html'
# ARTICLE_URL = '{date:%Y}/{slug}.html'

TIMEZONE = "Australia/Sydney"

DEFAULT_LANG = "English"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
# LINKS = (
#     ("CV/Professional", "https://jmckew.com/cv-professional/"),
#     ("Contact", "https://jmckew.com/contact/"),
# )
# LINKS = (('Pelican', 'http://getpelican.com/'),
#          ('Python.org', 'http://python.org/'),
#          ('Jinja2', 'http://jinja.pocoo.org/'),
#          ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (
    ("twitter", "https://twitter.com/Jac_McQ"),
    ("linkedin", "https://www.linkedin.com/in/jack-mckew/"),
    ("github", "https://github.com/JackMcKew"),
)

DEFAULT_PAGINATION = 20

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

