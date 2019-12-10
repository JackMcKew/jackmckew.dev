#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

RELATIVE_URLS = False
_DEFAULT_LANGUAGE = 'en'
PATH = "content"
AUTHOR = "Jack McKew"
SITENAME = "Jack McKew's Blog"
SITETITLE = SITENAME
SITESUBTITLE = "Python enthusiast, electrical engineer and tinkerer"
# SITEURL = "https://jackmckew.dev"
SITEURL = "https://jackmckew.github.io/jackmckew.dev/"
# SITEURL = "https://localhost:8000"


DISPLAY_PAGES_ON_MENU = True

DISQUS_SITENAME = 'jackmckew-dev'
GOOGLE_ANALYTICS = 'UA-131173168-2'


ARTICLE_URL = 'posts/{slug}.html'
# ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/index.html'
ARTICLE_SAVE_AS = 'posts/{slug}.html'
# YEAR_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/index.html'
# MONTH_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/index.html'
# DAY_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/index.html' 

THEME = "./themes/Flex"
# STATIC_PATHS = ["content/img","static"]
STATIC_PATHS = ["img","files","html","extra"]
EXTRA_PATH_METADATA = {
    'extra/favicon.ico': {'path': 'favicon.ico'},
    'extra/jm-photo.jpg' : {'path' : 'jm-photo.jpg'},
    'extra/CNAME' : {'path' : 'CNAME'}
}
SITELOGO = "/jm-photo.jpg"
# EXTRA_PATH_METADATA = {
    # 'img/favicon.ico' : {'path' : 'favicon.ico'}
# }
FAVICON = "/favicon.ico"
# CUSTOM_CSS = THEME + "static/custom.css"

USE_FOLDER_AS_CATEGORY = False
MAIN_MENU = True
HOME_HIDE_TAGS = False

MENUITEMS = (
    ("Archives", "/archives.html"),
    ("Categories", "/categories.html"),
    ("Tags", "/tags.html"),
    ("Sitemap", "/sitemap.xml"),
)

SITEMAP = {
    "format": "xml",
    "priorities": {"articles": 0.6, "indexes": 0.6, "pages": 0.5},
    "changefreqs": {"articles": "monthly", "indexes": "daily", "pages": "monthly"},
}

PLUGIN_PATHS = [
    './plugins/',
    # './plugins/pelican_youtube'
]

# PLUGIN_PATHS = [
#     "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins",
#     "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins\\pelican_youtube",
# ]

PLUGINS = [
    "sitemap",
    "better_codeblock_line_numbering",
    "better_code_samples",
    "deadlinks",
    "glossary",
    "multi_neighbors",
    "liquid_tags.notebook",
    # "pelican-ipynb.markup",
    # "pelican_youtube",
    "photos",
    "representative_image",
    "share_post",
    "always_modified",
    "dateish",
    "post_stats",
    "render_math"
]

# MARKUP = ('md', 'ipynb')
MARKUP = ('md', )
# IPYNB_USE_METACELL = True

# IGNORE_FILES = [".ipynb_checkpoints"] 

DELETE_OUTPUT_DIRECTORY = True

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

