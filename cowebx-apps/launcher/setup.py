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

    if subprocess.call([
        'pycoweb', 'deploy', dest, 
        '-f' if options.force else '',
        '-t', 'src/main/python/run_server.tmpl']):
        raise SetupError('aborted: cowebx deploy')
    # copy the webapps into place
    cmd = 'cp -r src/main/webapp/* ' + os.path.join(dest, 'www/')
    subprocess.check_call(cmd, shell=True)
    # copy the bots into place
    cmd = 'cp -r src/main/python/bots/* ' + os.path.join(dest, 'bots/')
    subprocess.check_call(cmd, shell=True)
    # copy updater example into place
    try:
        os.makedirs(os.path.join(dest, 'bin/updater/'))
    except OSError:
       pass
    cmd = 'cp -r src/main/python/updater/* ' + os.path.join(dest, 'bin/updater/')
    subprocess.check_call(cmd, shell=True)
    # copy the widgets / styles into place
    try:
        os.makedirs(os.path.join(dest, 'www/lib/cowebx'))
    except OSError:
        pass
    cmd = 'cp -r ../cowebx-widgets/cowebx-widgets-dojo/src/main/webapp ' + os.path.join(dest, 'www/lib/cowebx/dojo')
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
    if subprocess.call([
        'pycoweb', 'container', script,
        '-f' if options.force else '',
        '-t', 'src/main/python/run_server.tmpl']):
        raise SetupError('aborted: cowebx develop')

    # symlink apps into www/
    target = os.path.join(targetRoot, 'www')
    srcRoot = 'src/main/webapp/'
    _symlink_path(srcRoot, target)
    
    # symlink bots into bots/
    target = os.path.join(targetRoot, 'bots')
    srcRoot = 'src/main/python/bots'
    _symlink_path(srcRoot, target)

    # symlink updater into bin/updater/
    target = os.path.join(targetRoot, 'bin/updater')
    os.makedirs(target)
    srcRoot = 'src/main/python/updater'
    _symlink_path(srcRoot, target)

    # symlink widgets into www/lib/cowebx
    try:
        os.makedirs(os.path.join(targetRoot, 'www/lib/cowebx'))
    except OSError:
        pass
    target = os.path.join(targetRoot, 'www/lib/cowebx/dojo')
    src = os.path.abspath('../cowebx-widgets/cowebx-widgets-dojo/src/main/webapp')
    try:
        os.symlink(src, target)
    except OSError, e:
        print 'skipped: cowebx-widgets-dojo'
        
    # symlink dojo/dijit/dojox into www/lib/dojo-1.7-patched
    try:
        os.makedirs(os.path.join(targetRoot, 'www/lib/dojo-1.7-patched'))
    except OSError:
        pass
    target = os.path.join(targetRoot, 'www/lib/dojo-1.7-patched')
    src = os.path.abspath('../cowebx-apps/src/main/webapp/dojo-1.7-patched')
    try:
        os.symlink(src, target)
    except OSError, e:
        print 'skipped: dojo dijit dojox'
    
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