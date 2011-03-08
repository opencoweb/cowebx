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

class SetupError(Exception): pass

def _symlink_path(srcRoot, target):
    for path in os.listdir(srcRoot):
        if path.startswith('.') or path == 'WEB-INF': continue
        src = os.path.abspath(os.path.join(srcRoot, path))
        dest = os.path.join(target, path)
        try:
            os.symlink(src, dest)
        except OSError:
            print 'skipped: %s' % path

def deploy(options, args):
    '''Deploys the sample apps and their widgets into coweb deploy dir.'''
    # invoke pycoweb to create an empty deployment 
    try:
        dest = args[1]
    except IndexError:
        raise SetupError('missing: destination path')

    subprocess.check_call([
        'pycoweb', 'deploy', dest, 
        '-f' if options.force else '',
        '-t', 'src/main/python/run_server.tmpl'])
    # copy the webapps into place
    cmd = 'cp -r src/main/webapp/* ' + os.path.join(dest, 'www/')
    subprocess.check_call(cmd, shell=True)
    # copy the bots into place
    cmd = 'cp -r src/main/python/bots/* ' + os.path.join(dest, 'bots/')
    subprocess.check_call(cmd, shell=True)
    # copy the widgets / styles into place
    cmd = 'cp -r ../widgets ' + os.path.join(dest, 'www/cowebx-lib')
    subprocess.check_call(cmd, shell=True)

def develop(options, args):
    '''Symlinks the apps and widgets into an existing developer env.'''
    try:
        targetRoot = args[1]
    except IndexError:
        raise SetupError('missing: destination path')

    # create container script
    bin = os.path.join(targetRoot, 'bin')
    script = os.path.join(bin, 'run_server.py')
    subprocess.check_call([
        'pycoweb', 'container', script,
        '-f' if options.force else '',
        '-t', 'src/main/python/run_server.tmpl'])
    
    # symlink apps into www/
    target = os.path.join(targetRoot, 'www')
    srcRoot = 'src/main/webapp/'
    _symlink_path(srcRoot, target)
    
    # symlink bots into bots/
    target = os.path.join(targetRoot, 'bots')
    srcRoot = 'src/main/python/bots'
    _symlink_path(srcRoot, target)

    # symlink widgets into www/lib/cowebx
    target = os.path.join(targetRoot, 'www/lib/cowebx')
    src = os.path.abspath('../widgets')
    try:
        os.symlink(src, target)
    except OSError, e:
        print 'skipped: widgets'
    
if __name__ == '__main__':
    parser = optparse.OptionParser('usage: %prog <deploy|develop> [options] <PATH>')
    parser.add_option('-f', '--force', dest='force', action='store_true', default=False,
                  help='overwrite an existing file or folder (default: False)')
    (options, args) = parser.parse_args()

    try:
        func = globals()[args[0]]
    except Exception:
        parser.print_usage()
        sys.exit(255)
    try:
        func(options, args)
    except SetupError, e:
        print e
        sys.exit(1)