#!/bin/sh
cd usdpython
BASEPATH=$(dirname "$0")
export PATH=$PATH:$BASEPATH/USD:$PATH:$BASEPATH/usdzconvert;
export PYTHONPATH=$PYTHONPATH:$BASEPATH/USD/lib/python
curl --output ../tmp/$2 $3
usdzconvert ../tmp/$2 ../tmp/$1
if [ -e ../temp/$1 ]; then
  exit 0
else
  exit 64
fi