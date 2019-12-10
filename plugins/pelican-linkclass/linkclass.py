"""Link Class Plugin for Pelican"""

## Copyright (C) 2015, 2019  Rafael Laboissiere
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


import os
import sys
from pelican import signals
from . mdx_linkclass import LinkClassExtension, LC_CONFIG, LC_HELP

def addLinkClass (gen):

    if not gen.settings.get ('MARKDOWN'):
        from pelican.settings import DEFAULT_CONFIG
        gen.settings ['MARKDOWN'] = DEFAULT_CONFIG ['MARKDOWN']

    if gen.settings.get ('LINKCLASS'):
        for param, default, helptext in gen.settings.get ('LINKCLASS'):
            LC_CONFIG [param] = default
            LC_HELP [param] = helptext

    if LinkClassExtension not in gen.settings ['MARKDOWN']:
        config = dict ()
        for key, value in LC_CONFIG.items ():
            config [key] = value
        for key, value in gen.settings.items ():
            if key in LC_CONFIG:
                config [key] = value
        lcobj = LinkClassExtension (config)
        try:
            gen.settings ['MARKDOWN'] ['extensions'].append (lcobj)
        except (KeyError):
            gen.settings ['MARKDOWN'] ['extensions'] = [lcobj]

def register ():
    """Register the Link Class plugin with Pelican"""
    signals.initialized.connect (addLinkClass)
