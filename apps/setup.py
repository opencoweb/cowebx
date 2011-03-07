#!/usr/bin/env python
'''
Install script for cowebx apps. Requires prior install of Python coweb
server package and pycoweb script.

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
'''
import subprocess
import sys
import optparse
import os
import os.path

def install(options, args):
    # invoke pycoweb to create an empty deployment 
    subprocess.check_call([
        'pycoweb', 'deploy', args[1], 
        '-f' if options.force else '',
        '-t', 'src/main/python/run_server.tmpl'])
    # copy the webapps into place
    cmd = 'cp -r src/main/webapp/* ' + os.path.join(args[1], 'www/')
    subprocess.check_call(cmd, shell=True)
    # copy the bots into place
    cmd = 'cp -r src/main/python/bots/* ' + os.path.join(args[1], 'bots/')
    subprocess.check_call(cmd, shell=True)
    # copy the widgets / styles into place
    cmd = 'cp -r ../widgets ' + os.path.join(args[1], 'www/lib/cowebx')
    subprocess.check_call(cmd, shell=True)

def develop(path):
    pass

if __name__ == '__main__':
    parser = optparse.OptionParser('usage: %prog <install|develop> [options] <PATH>')
    parser.add_option('-f', '--force', dest='force', action='store_true', default=False,
                  help='overwrite an existing file or folder (default: False)')
    (options, args) = parser.parse_args()

    try:
        func = globals()[args[0]]
    except (KeyError, IndexError):
        parser.print_usage()
        sys.exit(255)
    func(options, args)