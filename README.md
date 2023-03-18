> A public network of distributed diffusers workers

```bash
echo "@danielesteban:registry=https://npm.pkg.github.com" >> .npmrc
pnpm install @danielesteban/diffusers
```

```js
import Diffusers from '@danielesteban/diffusers';

// Create an application key at:
// https://diffusers.gatunes.com
const diffusers = new Diffusers(
  'YourApplicationKey'
);

const input = await fetch('https://example.com/input_image.png');
const image = await input.blob();
const generated = await diffusers.diffusion(
  image,
  'disco dancer with colorful lights',
  'deformed, distorted, disfigured',
  '0.5'
);
const upscaled = await diffusers.upscale(generated);

window.open(URL.createObjectURL(upscaled));
```

### Worker

Docker compose

```yaml
services:
  worker:
    image: ghcr.io/danielesteban/diffusers/worker:v0.0.2
    restart: always
    environment:
     - PIPELINES_DEPTH=True
     - PIPELINES_DIFFUSION=True
     - PIPELINES_UPSCALE=True
    volumes:
     - models:/home/worker/models
volumes:
  models:
```

Windows GUI

[diffusers-worker-0.0.2.exe](https://github.com/danielesteban/diffusers/releases/download/v0.0.2/diffusers-worker-0.0.2.exe)
