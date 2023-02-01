#!/bin/sh
STATUS=$(curl -w %{http_code} http://$1/fileUpload/upload2GCS -F file1=@./tmp/$2 -F file2=@$3)
INTSTATUS=$(($STATUS+0))
if [ $INTSTATUS -eq 204 ]; then
  exit 0
else
  exit 64
fi