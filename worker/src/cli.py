#!/usr/bin/env python
import asyncio
from logger import Logger
import sys
import warnings

warnings.filterwarnings('ignore')
sys.stderr = Logger(
  sys.stderr
)

from worker import Worker

class CLI(Worker):
  def setStatus(self, text):
    print(text)

  def setTitle(self, text):
    print(text)

  def setMessage(self, text):
    print(text)

worker = CLI()
loop = asyncio.get_event_loop()
asyncio.ensure_future(worker.loop())
loop.run_forever()
