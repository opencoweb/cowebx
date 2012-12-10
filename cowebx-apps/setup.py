#!/usr/bin/env python
'''
Install script for cowebx apps. Requires prior install of Python coweb
server package and pycoweb script.

If this script is run from within an activated virtual env, it will be the
default install path. Otherwise, the install path must be explicitly given
(and can override using the virtual env path).

Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
'''
import subprocess
import sys
import argparse
import os
import os.path

_widgetLoc = "../cowebx-widgets/cowebx-widgets-dojo"

class SetupError(Exception): pass

def rm(target, f):
	subprocess.call(["rm", "-rf", os.path.join(target, f)])

def ln(src, target):
	subprocess.call(["ln", "-s", src, target])

def _symlink_path(srcRoot, target):
	for path in os.listdir(srcRoot):
		if path.startswith('.') or path == 'WEB-INF': continue
		src = os.path.abspath(os.path.join(srcRoot, path))
		dest = os.path.join(target, path)
		try:
			os.symlink(src, dest)
		except OSError:
			print('skipped: %s' % path)

def deploy(args):
	'''Deploys the sample apps and their widgets into coweb deploy dir.'''
	# invoke pycoweb to create an empty deployment 
	try:
		dest = args.path
	except IndexError:
		raise SetupError('missing: destination path')

	pref = args.app + '/src/main'

	if subprocess.call([
		'pycoweb', 'deploy', dest, 
		'-f' if args.force else '',
		'-t', pref + '/python/run_server.tmpl']):
		raise SetupError('aborted: cowebx deploy')

	# copy the webapps into place
	cmd = 'cp -r ' + pref + '/webapp/* ' + os.path.join(dest, 'www/')
	subprocess.check_call(cmd, shell=True)

	# copy updater scripts, bots, and moderator if they exist

	if os.path.exists(pref + "/python/updater"):
		cmd = 'cp -r ' + pref + '/python/updater ' +\
				os.path.join(dest, 'bin')
		subprocess.check_call(cmd, shell=True)

	if os.path.exists(pref + "/python/bots"):
		cmd = 'cp -r ' + pref + '/python/bots/* ' + os.path.join(dest, 'bots/')
		subprocess.check_call(cmd, shell=True)

	if os.path.exists(pref + "/python/moderator.py"):
		rm(dest, 'bin/moderator.py')
		cmd = 'cp ' + pref + '/python/moderator.py ' + os.path.join(dest, 'bin')
		subprocess.check_call(cmd, shell=True)

	# copy the widgets / styles into place
	try:
		os.makedirs(os.path.join(dest, 'www/lib/cowebx'))
	except OSError:
		pass
	cmd = 'cp -r ' + _widgetLoc + '/src/main/webapp ' +\
		  os.path.join(dest, 'www/lib/cowebx/dojo')
	subprocess.check_call(cmd, shell=True)

def develop(args):
	'''Symlinks the apps and widgets into an existing developer env.'''
	try:
		dest = args.path
	except IndexError:
		raise SetupError('missing: destination path')

	pref = args.app + '/src/main'

	# create container script
	if subprocess.call([
		'pycoweb', 'deploy', dest, 
		'-f' if args.force else '',
		'-t', pref + '/python/run_server.tmpl']):
		raise SetupError('aborted: cowebx develop')

	# symlink the webapps
	target = os.path.join(dest, 'www')
	_symlink_path(pref + '/webapp', target)
	
	# symlink updater, bots, and moderator if they exist

	if os.path.exists(pref + "/python/updater"):
		target = os.path.join(dest, 'bin/updater')
		rm(dest, 'bin/updater')
		os.mkdir(target)
		_symlink_path(pref + '/python/updater', target)

	if os.path.exists(pref + "/python/bots"):
		# symlink bots into bots/
		target = os.path.join(dest, 'bots')
		rm(dest, 'bots')
		os.mkdir(target)
		_symlink_path(pref + '/python/bots', target)

	if os.path.exists(pref + "/python/moderator.py"):
		# symlink moderator
		rm(dest, 'bin/moderator.py')
		ln(os.path.abspath(pref + '/python/moderator.py'),
				os.path.join(dest, 'bin/moderator.py'))

	# symlink widgets into www/lib/cowebx
	try:
		os.makedirs(os.path.join(dest, 'www/lib/cowebx'))
	except OSError:
		pass
	target = os.path.join(dest, 'www/lib/cowebx/dojo')
	src = os.path.abspath(_widgetLoc + '/src/main/webapp')
	try:
		os.symlink(src, target)
	except OSError as e:
		print('skipped: cowebx-widgets-dojo')

def clean(args):
	'''Cleans up the workpath files created by this script.'''
	try:
		dest= args.path
	except IndexError:
		raise SetupError('missing: destination path')
	rm(dest, 'bin/updater')
	rm(dest, 'bin/run_server.py')
	rm(dest, 'bin/moderator.py')
	rm(dest, 'www')
	rm(dest, 'bots')

if __name__ == '__main__':
	defaultPath = os.environ.get('VIRTUAL_ENV')
	parser = argparse.ArgumentParser(prog='setup.py')
	parser.add_argument('-f', '--force', dest='force', action='store_true',
			default=False,
			help='overwrite an existing file or folder (default: False)')
	parser.add_argument('-a', '--app', action='store')
	parser.add_argument('action', action='store', choices=['deploy', 'develop',
		'clean'])
	parser.add_argument('-p', '--path', action='store', default=defaultPath)
	args = parser.parse_args()

	if not args.path:
		print("No target path specified! Please run this script in an activated"
				"virtual env, or specify the path with -p.")
		parser.print_usage()
		sys.exit(1)

	# Doesn't matter what the app is when we clean.
	if "clean" != args.action:
		if args.app is None:
			parser.print_usage();
			sys.exit(1)
		elif not os.path.exists(args.app):
			print("Path " + args.app + " does not exist")
			sys.exit(1)

	try:
		func = globals()[args.action]
	except Exception:
		parser.print_usage()
		sys.exit(1)
	try:
		func(args)
	except SetupError as e:
		print(e)
		sys.exit(1)
