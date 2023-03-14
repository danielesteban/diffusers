// @ts-ignore
export const baseURL: string = __SERVER__;

type RequestParams = {
  endpoint: string;
  body?: any;
  method?: string;
  session?: string;
  signal?: AbortSignal;
};

const req = async ({
  endpoint,
  body,
  method = 'GET',
  session,
  signal,
}: RequestParams) => {
  const res = await fetch(`${baseURL}${endpoint}`, {
    headers: {
      ...(session ? { Authorization: `Bearer ${session}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    method,
    signal,
  });
  if (res.status < 200 || res.status >= 400) {
    throw new Error(`HTTP-STATUS: ${res.status}`);
  }
  return res;
};

export const request = async <T>(params: RequestParams): Promise<T> => {
  const res = await req(params);
  const type = res.headers.get('content-type') || '';
  if (type.indexOf('application/json') !== 0) {
    throw new Error(`CONTENT-TYPE: ${type}`);
  }
  return await res.json();
};

export const requestBuffer = async (params: RequestParams): Promise<ArrayBuffer> => {
  const res = await req(params);
  return await res.arrayBuffer();
};
