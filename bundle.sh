#!/bin/bash
OPWD=$PWD
read -s -p "GPG password: " KEYPASS
echo
mvn -DperformRelease=true -Dgpg.passphrase=$KEYPASS -Dmaven.artifact.gpg.keyname=9B71B7C5 clean source:jar javadoc:jar verify
if [[ $? != 0 ]]; then
    exit $?
fi
rm bundles/*
mkdir bundles
MODULES="
.
cowebx-apps
cowebx-widgets
cowebx-widgets/cowebx-widgets-dojo
"
for MODULE in $MODULES; do
    TARGET="$OPWD/$MODULE/target"
    NAME=`basename $MODULE`
    if [[ $NAME == '.' ]]; then
        NAME='cowebx'
    fi
    JAR="$OPWD/bundles/$NAME.bundle.jar"
    cd $TARGET
    jar cvf "$JAR" *.pom *.asc *.war *.jar
done
