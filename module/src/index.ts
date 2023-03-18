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

  private request(body: FormData, endpoint: string) {
    const { client, retry, retryDelay, server } = this;
    return new Promise<Blob>((resolve, reject) => {
      let attempt = 0;
      const request = () => (
        fetch(`${server}${endpoint}?client=${client}`, { body, method: 'POST' })
          .then((res) => {
            if (res.status < 200 || res.status >= 400) {
              throw new Error(`STATUS:${res.status}`);
            }
            return res.blob();
          })
          .then(resolve)
          .catch((err) => {
            if (err.message === 'STATUS:401') {
              err = new Error(`The application key: '${client}' is not valid for the origin: '${location.origin}'`);
            } else if (err.message === 'STATUS:503') {
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

  depth(image: Blob) {
    const body = new FormData();
    body.append('image', image);
    return this.request(body, 'depth');
  }

  diffusion(
    image: Blob,
    prompt: string,
    negativePrompt?: string,
    strength?: number,
    steps?: number
  ) {
    const body = new FormData();
    body.append('image', image);
    body.append('prompt', prompt);
    if (negativePrompt !== undefined) {
      body.append('negative_prompt', negativePrompt);
    }
    if (steps !== undefined) {
      body.append('steps', `${steps}`);
    }
    if (strength !== undefined) {
      body.append('strength', `${strength}`);
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