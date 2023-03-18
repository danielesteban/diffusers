from diffusers import ControlNetModel, StableDiffusionControlNetPipeline
from io import BytesIO
from cv2 import Canny
from numpy import array, concatenate, max
from math import floor
import os
from PIL import Image, ImageOps
from RealESRGAN import RealESRGAN
import torch
from transformers import DPTForDepthEstimation, DPTFeatureExtractor

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def formatInput(image):
  image = Image.open(image).convert('RGB')
  image.thumbnail((512, 512))
  width, height = image.size
  if width % 8 > 0 or height % 8 > 0:
    image = image.resize((floor(width / 8) * 8, floor(height / 8) * 8))
  return image

def formatOutput(image):
  buf = BytesIO()
  image.save(buf, format='PNG')
  return buf.getvalue()

class Depth:
  def __init__(self):
    self.model = DPTForDepthEstimation.from_pretrained(
      'Intel/dpt-hybrid-midas',
      low_cpu_mem_usage=True,
      cache_dir='models',
    )
    self.feature_extractor = DPTFeatureExtractor.from_pretrained(
      'Intel/dpt-hybrid-midas',
      cache_dir='models',
    )

  def run(self, image):
    image = formatInput(image)
    inputs = self.feature_extractor(images=image, return_tensors='pt')
    with torch.no_grad():
      outputs = self.model(**inputs)
      predicted_depth = outputs.predicted_depth
    prediction = torch.nn.functional.interpolate(
      predicted_depth.unsqueeze(1),
      size=image.size[::-1],
      mode='bicubic',
      align_corners=False,
    )
    output = prediction.squeeze().cpu().numpy()
    result = (output * 255 / max(output)).astype('uint8')
    return formatOutput(Image.fromarray(result))

class Diffusion:
  def __init__(self):
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    self.controlnet = ControlNetModel.from_pretrained(
      'lllyasviel/sd-controlnet-canny',
      torch_dtype=torch_dtype,
      cache_dir='models',
    )
    self.pipeline = StableDiffusionControlNetPipeline.from_pretrained(
      'runwayml/stable-diffusion-v1-5',
      controlnet=self.controlnet,
      torch_dtype=torch_dtype,
      cache_dir='models',
    ).to(device)
    self.pipeline.requires_safety_checker = False
    if torch.cuda.is_available():
      self.pipeline.enable_model_cpu_offload()
      if os.name != 'nt':
        self.pipeline.unet = torch.compile(self.pipeline.unet)

  def run(
    self,
    image,
    max_threshold,
    min_threshold,
    negative_prompt,
    prompt,
    steps,
    strength
  ):
    image = formatInput(image)
    image = Canny(array(image), min_threshold, max_threshold)
    image = image[:, :, None]
    image = concatenate([image, image, image], axis=2)
    image = Image.fromarray(image)
    result = self.pipeline(
      prompt,
      controlnet_conditioning_scale=strength,
      image=image,
      generator=torch.Generator(device=device).manual_seed(torch.random.seed()),
      negative_prompt=negative_prompt,
      num_inference_steps=steps,
      width=image.size[0],
      height=image.size[1],
    )
    return formatOutput(result.images[0])

class Upscale:
  def __init__(self):
    self.model = RealESRGAN(device, scale=4)
    self.model.load_weights('models/RealESRGAN_x4.pth', download=True)
  
  def run(self, image):
    image = formatInput(image)
    result = self.model.predict(image)
    return formatOutput(result)
