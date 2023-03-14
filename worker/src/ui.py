import html
from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QDesktopWidget, QLabel, QVBoxLayout, QWidget

class UI(QWidget):
  def __init__(self):
    super().__init__()
    self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowMinimizeButtonHint)
    self.setStyleSheet('background:#000;color:#fff;font-size:11px;')
    self.resize(512, 64)
    rect = self.frameGeometry()
    rect.moveCenter(QDesktopWidget().availableGeometry().center())
    self.move(rect.topLeft())

    layout = QVBoxLayout()
    layout.setAlignment(Qt.AlignVCenter)

    title = QLabel()
    title.setAlignment(Qt.AlignCenter)
    layout.addWidget(title)
    self.titleLabel = title

    message = QLabel()
    message.setAlignment(Qt.AlignCenter)
    layout.addWidget(message)
    self.messageLabel = message

    self.setLayout(layout)

  def setTitle(self, text):
    self.titleLabel.setText('<pre>' + html.escape(text) + '</pre>')
    self.setMessage('')
  
  def setMessage(self, text):
    self.messageLabel.setText('<pre>' + html.escape(text) + '</pre>')
