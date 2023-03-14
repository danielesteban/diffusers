import json
from os import environ, path

config = {
  'pipelines': {
    'depth': environ.get('PIPELINES_DEPTH') != 'False',
    'diffusion': environ.get('PIPELINES_DIFFUSION') != 'False',
    'upscale': environ.get('PIPELINES_UPSCALE') != 'False',
  },
  'server': environ['SERVER'] if 'SERVER' in environ else 'wss://diffusers.gatunes.com/server/worker',
}

if path.exists('config.json'):
  with open('config.json', 'r') as file:
    stored = json.loads(file.read())
    if 'pipelines' in stored:
      for key in stored['pipelines']:
        config['pipelines'][key] = stored['pipelines'][key]
    if 'server' in stored:
      config['server'] = stored['server']

def setPipeline(pipeline, enabled):
  config['pipelines'][pipeline] = enabled
  with open('config.json', 'w') as file:
    json.dump(config, file)
