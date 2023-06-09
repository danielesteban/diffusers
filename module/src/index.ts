class Diffusers {
  private readonly client: string;
  private readonly retry: number;
  private readonly retryDelay: number;
  private readonly server: string;

  constructor(
    client: string,
    retry: number = Infinity,
    retryDelay: number = 1000,
    server: string = 'https://diffusers.gatunes.com/server/'
  ) {
    this.client = client;
    this.retry = retry;
    this.retryDelay = retryDelay;
    this.server = server;
  }
  
  private checkStatus(status: number) {
    const { client } = this;
    if (status === 401) {
      throw new Error(`The application key: '${client}' is not valid for the origin: '${location.origin}'`);
    }
    if (status < 200 || status >= 400) {
      throw new Error(`STATUS:${status}`);
    }
  }

  private request(body: FormData, endpoint: string) {
    const { client, retry, retryDelay, server } = this;
    return new Promise<Blob>((resolve, reject) => {
      let attempt = 0;
      const request = () => (
        fetch(`${server}${endpoint}?client=${client}`, { body, method: 'POST' })
          .then((res) => {
            this.checkStatus(res.status);
            return res.blob();
          })
          .then(resolve)
          .catch((err) => {
            if (err.message === 'STATUS:503') {
              if (attempt++ < retry) {
                setTimeout(request, retryDelay);
                return;
              }
              err = new Error('No available workers');
            }
            reject(err);
          })
      );
      request();
    });
  }

  available() {
    const { client, server } = this;
    return fetch(`${server}workers?client=${client}`)
      .then((res) => {
        this.checkStatus(res.status);
        return res.json();
      })
      .then((workers) => (
        workers as { depth: number; diffusion: number; upscale: number; }
      ));
  }

  depth(image: Blob) {
    const body = new FormData();
    body.append('image', image);
    return this.request(body, 'depth');
  }

  diffusion(
    image: Blob,
    {
      maxThreshold,
      minThreshold,
      negativePrompt,
      prompt,
      steps,
      strength,
    }: {
      minThreshold?: number;
      maxThreshold?: number;
      negativePrompt?: string;
      prompt: string;
      steps?: number;
      strength?: number;
    }
  ) {
    const body = new FormData();
    body.append('image', image);
    if (maxThreshold !== undefined) {
      body.append('max_threshold', `${maxThreshold}`);
    }
    if (minThreshold !== undefined) {
      body.append('min_threshold', `${minThreshold}`);
    }
    if (negativePrompt !== undefined) {
      body.append('negative_prompt', negativePrompt);
    }
    body.append('prompt', prompt);
    if (strength !== undefined) {
      body.append('strength', `${strength}`);
    }
    if (steps !== undefined) {
      body.append('steps', `${steps}`);
    }
    return this.request(body, 'diffusion');
  }

  upscale(image: Blob) {
    const body = new FormData();
    body.append('image', image);
    return this.request(body, 'upscale');
  }
}

export default Diffusers;
