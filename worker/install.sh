#!/usr/bin/sh
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu118 && \
pip install -r requirements_gui.txt 
