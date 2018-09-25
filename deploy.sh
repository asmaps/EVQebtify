#!/bin/bash

set -e
quasar build
rsync -ave ssh dist/spa-mat/ public.asw.io:/opt/public-www/evqebtify
