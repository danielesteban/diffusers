from config import config, setPipeline
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QAction, QMenu, QSystemTrayIcon

class Menu(QSystemTrayIcon):
  def __init__(self, app):
    super().__init__()

    self.icons = {
      'error': QIcon('icons/error.png'),
      'working': QIcon('icons/working.png'),
      'ready': QIcon('icons/ready.png'),
    }

    menu = QMenu()

    self.status = QAction('Loading...')
    self.status.setDisabled(True)
    menu.addAction(self.status)

    self.config = QMenu('Pipelines')
    self.pipelines = {}
    for key in config['pipelines']:
      self.pipelines[key] = QAction(key)
      self.pipelines[key].setCheckable(True)
      self.pipelines[key].setChecked(config['pipelines'][key])
      self.pipelines[key].toggled.connect(
        lambda checked, pipeline=key: setPipeline(pipeline, checked)
      )
      self.config.addAction(self.pipelines[key])
    menu.addMenu(self.config)

    self.quit = QAction('Quit')
    self.quit.triggered.connect(app.quit)
    menu.addAction(self.quit)

    self.setContextMenu(menu)
    self.setIcon('error')
    self.setVisible(True)

  def setIcon(self, icon):
    super().setIcon(self.icons[icon])

  def setStatus(self, text):
    self.status.setText(text)
