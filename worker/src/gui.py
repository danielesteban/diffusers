#!/usr/bin/env python
import asyncio
from logger import Logger
from menu import Menu
from PyQt5.QtWidgets import QApplication
from qasync import QEventLoop
from ui import UI
import sys
import warnings

warnings.filterwarnings('ignore')
sys.stderr = Logger(
  # sys.stderr
)

from worker import Worker

class GUI(Worker):
  def __init__(self):
    self.app = QApplication([])
    self.app.setQuitOnLastWindowClosed(False)
    self.menu = Menu(self.app)
    self.ui = UI()
    if '-quiet' not in sys.argv:
      self.ui.show()
    sys.stderr.attach(self.app, self.ui)
    super().__init__()
    sys.stderr.detach()
    self.ui.close()

  def setIcon(self, icon):
    self.menu.setIcon(icon)

  def setStatus(self, text):
    self.menu.setStatus(text)

  def setTitle(self, text):
    self.ui.setTitle(text)
    self.app.processEvents()

  def setMessage(self, text):
    self.ui.setMessage(text)
    self.ui.show()

worker = GUI()
loop = QEventLoop(worker.app)
asyncio.set_event_loop(loop)
asyncio.ensure_future(worker.loop())
loop.run_forever()
