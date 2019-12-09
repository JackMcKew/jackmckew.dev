"""Markdown extension for the Link Class plugin for Pelican"""

## Copyright (C) 2015, 2017, 2019  Rafael Laboissiere
##
## This program is free software: you can redistribute it and/or modify it
## under the terms of the GNU General Affero Public License as published by
## the Free Software Foundation, either version 3 of the License, or (at
## your option) any later version.
##
## This program is distributed in the hope that it will be useful, but
## WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
## Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see http://www.gnu.org/licenses/.


from markdown.extensions import Extension
from markdown.inlinepatterns import LinkInlineProcessor, LINK_RE
from markdown.inlinepatterns import ReferenceInlineProcessor, REFERENCE_RE
import re
import sys

LC_CONFIG = {'INTERNAL_CLASS': 'internal',
             'EXTERNAL_CLASS': 'external'}
LC_HELP = {'INTERNAL_CLASS': 'Name of the CSS class for internal links',
           'EXTERNAL_CLASS': 'Name of the CSS class for external links'}

### Utlity function for adding the appropriate class attribute
def add_class (elm, config):
    try:
        m = re.match ('^https?://', elm.get ('href'))
        elm.set ('class', m and config ['EXTERNAL_CLASS']
                          or config ['INTERNAL_CLASS'])
    except AttributeError:
        pass
    return elm

class LinkClassExtension (Extension):
    """Markdown extension for the Link Class plugin"""

    def __init__(self, config):
        for key,value in LC_CONFIG.items():
            self.config [key] = [value, LC_HELP [key]]
        super (LinkClassExtension, self).__init__ (**config)

    def extendMarkdown (self, md):
        """Register the Markdown extension"""

        ## LinkClass instances is added to the list of inline pattern
        ## processors, with higher priority than the processor defined for the
        ## "link" and the "reference" objects, such that the normal behavior is
        ## overridden.
        LinkClassPattern = LinkClass (LINK_RE, self.getConfigs ())
        LinkClassPattern.md = md
        md.inlinePatterns.register (LinkClassPattern, 'linkclass', 200)
        ReferenceClassPattern = ReferenceClass (REFERENCE_RE, self.getConfigs ())
        ReferenceClassPattern.md = md
        md.inlinePatterns.register (ReferenceClassPattern, 'referenceclass', 200)

class LinkClass (LinkInlineProcessor):
    """Markdown inline pattern processor for adding class attribute to
inline-style hyperlinks"""

    def __init__ (self, pattern, config):
        """Initialize the Markdwon inline pattern processor"""

        super (LinkClass, self).__init__ (pattern)
        ## Store the configuration dict
        self.config = config

    def handleMatch (self, m, data):
        """Add the class attribute to the generated <a> element"""

        ## Build the <a> element using the parent class
        elm, start, end = super (LinkClass, self).handleMatch (m, data)
        ## Return the <a> element with added class
        return add_class (elm, self.config), start, end

class ReferenceClass (ReferenceInlineProcessor):
    """Markdown inline pattern processor for adding class attribute to
inline-style references"""

    def __init__ (self, pattern, config):
        """Initialize the Markdwon inline pattern processor"""

        super (ReferenceClass, self).__init__ (pattern)
        ## Store the configuration dict
        self.config = config

    def handleMatch (self, m, data):
        """Add the class attribute to the generated <a> element"""

        ## Build the <a> element using the parent class
        elm, start, end = super (ReferenceClass, self).handleMatch (m, data)
        ## Return the <a> element with added class
        return add_class (elm, self.config), start, end

def makeExtension (config = None):
    """Wrapper for a MarkDown extension"""
    return LinkClassExtension (config = config)
