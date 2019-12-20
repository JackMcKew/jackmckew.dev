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
SITEURL = "https://jackmckew.dev"
# SITEURL = "https://jackmckew.github.io/jackmckew.dev/"
# SITEURL = "http://localhost:8000"


DISPLAY_PAGES_ON_MENU = True

DISQUS_SITENAME = 'jackmckew-dev'
GOOGLE_ANALYTICS = 'UA-131173168-2'

# GOOGLE_ADSENSE = {
#     'ca_id': 'ca-pub-1052275056735196',    # Your AdSense ID
#     'page_level_ads': True,          # Allow Page Level Ads (mobile)
#     'ads': {
#         'aside': '1234561',          # Side bar banner (all pages)
#         'main_menu': '1234562',      # Banner before main menu (all pages)
#         'index_top': '1234563',      # Banner after main menu (index only)
#         'index_bottom': '1234564',   # Banner before footer (index only)
#         'article_top': '1234565',    # Banner after article title (article only)
#         'article_bottom': '1234566', # Banner after article content (article only)
#     }
# }

USE_TIPUE_SEARCH = True

GITHUB_CORNER_URL = 'https://github.com/JackMcKew/jackmckew.dev'

ARTICLE_URL = '{slug}.html'
# ARTICLE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/{slug}/index.html'
ARTICLE_SAVE_AS = '{slug}.html'
# YEAR_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/index.html'
# MONTH_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/index.html'
# DAY_ARCHIVE_SAVE_AS = 'posts/{date:%Y}/{date:%b}/{date:%d}/index.html' 

THEME = "./themes/Flex"
# STATIC_PATHS = ["content/img","static"]
STATIC_PATHS = ["img","files","html","extra","2018","2019"]
# STATIC_SAVE_AS = "{dirname}"
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
    # ("Search","/search.html")
)

NOTEBOOK_DIR = ''
CODE_DIR = ''

SITEMAP = {
    "format": "xml",
    "priorities": {"articles": 0.8, "indexes": 0.6, "pages": 0.7},
    "changefreqs": {"articles": "weekly", "indexes": "daily", "pages": "monthly"},
}

PLUGIN_PATHS = [
    './plugins/',
    # './plugins/pelican_youtube'
]

# PLUGIN_PATHS = [
#     "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins",
#     "C:\\\\Users\\jackm\\.virtualenvs\\blog-mLKe2F5s\\Lib\\site-packages\\pelican\\pelican-plugins\\pelican_youtube",
# ]

DIRECT_TEMPLATES = (('index', 'tags', 'categories', 'archives','search'))

PLUGINS = [
    "sitemap",
    "better_codeblock_line_numbering",
    "better_code_samples",
    "bootstrapify",
    "deadlinks",
    "more_categories",
    "neighbors",
    "pelican-ert",
    "liquid_tags.notebook",
    "liquid_tags.include_code",
    "representative_image",
    "share_post",
    'show_source',
    'tipue_search',
    "dateish",
    "post_stats",
    "render_math",
    "autostatic",
    "clean_summary"
]
CLEAN_SUMMARY_MAXIMUM = 1
# MARKUP = ('md', 'ipynb')
MARKUP = ('md', )
MARKDOWN = {
    'extension_configs': {
        'markdown.extensions.codehilite': {'css_class': 'highlight', 'linenums' : 'True'},
        'markdown.extensions.extra': {},
        'markdown.extensions.meta': {},
    },
    'output_format': 'html5',
}
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


# Social widget
SOCIAL = (
    ("twitter", "https://twitter.com/Jac_McQ"),
    ("linkedin", "https://www.linkedin.com/in/jack-mckew/"),
    ("github", "https://github.com/JackMcKew"),
)

DEFAULT_PAGINATION = 20

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

