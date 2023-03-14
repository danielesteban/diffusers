#!/usr/bin/sh
pyinstaller --icon icons/ready.png --noconfirm --windowed \
  --add-data 'config.json;.' \
  --add-data 'icons/*.png;icons' \
  --copy-metadata tqdm --copy-metadata regex --copy-metadata requests \
  --copy-metadata packaging --copy-metadata filelock --copy-metadata numpy \
  --copy-metadata tokenizers --collect-all transformers --collect-all xformers \
  src/gui.py
