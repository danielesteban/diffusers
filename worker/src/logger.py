class Logger(object):
  def __init__(self, console = None):
    self.console = console
    self.detach()

  def write(self, msg):
    if self.console is not None:
      self.console.write(msg)

    if self.app is None or self.ui is None:
      return

    self.buffer = self.buffer + msg
    while True:
      line = self.getLine()
      if line:
        self.ui.setMessage(line)
      elif line is None:
        break
    self.app.processEvents()

  def flush(self):
    if self.console is not None:
      self.console.flush()

  def getLine(self):
    nl = self.buffer.find('\r')
    if nl == -1:
      nl = self.buffer.find('\n')
    if nl == -1:
      return None
    line = self.buffer[:nl]
    esc = self.buffer.find(chr(27)) 
    if esc != -1:
      line = line[:esc]
    self.buffer = self.buffer[nl+1:]
    return line

  def attach(self, app, ui):
    self.buffer = ''
    self.app = app
    self.ui = ui

  def detach(self):
    self.buffer = ''
    self.app = None
    self.ui = None
