#!/bin/sh
STATUS=$(curl -w %{http_code} http://$1/upload/usdzUpload -F file1=@./tmp/$2 -F file2=@$3)
INTSTATUS=$(($STATUS+0))
if [ $INTSTATUS -eq 204 ]; then
  sh ./setproductobj.sh $2 $3
else
  exit 64
fi