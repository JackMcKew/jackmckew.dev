from __future__ import unicode_literals

LOAD_CONTENT_CACHE = False

SITEURL = ""
SITENAME = "ipynb-test"

TIMEZONE = "UTC"
DEFAULT_LANG = "en"

MARKUP = ("md",)

# PLUGINS SETTINGS
PLUGIN_PATHS = ["../../../../plugins"]
PLUGINS = ["ipynb.markup", "ipynb.liquid"]

THEME = "theme"
