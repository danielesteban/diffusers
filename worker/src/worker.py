import asyncio
from io import BytesIO
from config import config
import messages_pb2
from pipelines import Depth, Diffusion, Upscale
import socket
import websockets

Config = messages_pb2.Config
Job = messages_pb2.Job
Version = messages_pb2.DESCRIPTOR.GetOptions().Extensions[messages_pb2.protocol_version]

class Worker(object):
  def __init__(self):
    self.pipelines = {
      'depth': None,
      'diffusion': None,
      'upscale': None,
    }

    if config['pipelines']['depth']:
      self.setTitle('Loading depth pipeline...')
      self.pipelines['depth'] = Depth()

    if config['pipelines']['diffusion']:
      self.setTitle('Loading diffusion pipeline...')
      self.pipelines['diffusion'] = Diffusion()

    if config['pipelines']['upscale']:
      self.setTitle('Loading upscale pipeline...')
      self.pipelines['upscale'] = Upscale()

  def process(self, request):
    job = Job()
    job.ParseFromString(request)

    if self.pipelines['depth'] is not None and job.HasField('depth'):
      return self.pipelines['depth'].run(BytesIO(job.depth.image))

    if self.pipelines['diffusion'] is not None and job.HasField('diffusion'):
      return self.pipelines['diffusion'].run(
        BytesIO(job.diffusion.image),
        job.diffusion.max_threshold,
        job.diffusion.min_threshold,
        job.diffusion.negative_prompt,
        job.diffusion.prompt,
        job.diffusion.steps,
        job.diffusion.strength
      )

    if self.pipelines['upscale'] is not None and job.HasField('upscale'):
      return self.pipelines['upscale'].run(BytesIO(job.upscale.image))

  async def handshake(self, ws):
    config = Config()
    config.pipelines.depth = self.pipelines['depth'] is not None
    config.pipelines.diffusion = self.pipelines['diffusion'] is not None
    config.pipelines.upscale = self.pipelines['upscale'] is not None
    config.version = Version
    try:
      await ws.send(config.SerializeToString())
      result = await asyncio.wait_for(ws.recv(), timeout=30)
    except:
      result = 'connection timeout'
    
    if result == 'OK':
      return True

    self.setIcon('error')
    self.setStatus('Server error')
    self.setTitle('Server error')
    self.setMessage(result)

  async def loop(self):
    while True:
      try:
        self.setStatus('Connecting...')
        async with websockets.connect(config['server']) as ws:
          if not await self.handshake(ws):
            break
          self.setStatus('Connected')
          while True:
            self.setIcon('ready')
            try:
              request = await asyncio.wait_for(ws.recv(), timeout=30)
            except (asyncio.TimeoutError, websockets.exceptions.ConnectionClosed):
              try:
                pong = await ws.ping()
                await asyncio.wait_for(pong, timeout=5)
                continue
              except:
                await asyncio.sleep(5)
                break
            self.setIcon('working')
            await ws.send(self.process(request))
      except socket.gaierror or ConnectionRefusedError:
        self.setIcon('error')
        self.setStatus('Disconnected')
        await asyncio.sleep(5)
        continue
      except Exception as e:
        print(e)
        break

  def setIcon(self, icon):
    pass

  def setStatus(self, text):
    pass

  def setTitle(self, text):
    pass

  def setMessage(self, text):
    pass
