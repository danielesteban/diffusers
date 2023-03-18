FROM nvidia/cuda:11.8.0-base-ubuntu20.04
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG C.UTF-8

RUN groupadd --gid 1000 worker && \
  useradd --uid 1000 --gid worker --shell /bin/bash --create-home worker && \
  apt-get update && \
  apt-get install -y --no-install-recommends software-properties-common curl git libgl1 && \
  add-apt-repository ppa:deadsnakes/ppa && \
  apt-get install -y --no-install-recommends python3.10 python3.10-venv python3.10-distutils && \
  ln -sf /usr/bin/python3.10 /usr/bin/python && \
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
  python get-pip.py && \
  apt-get clean && \ 
  rm -rf /var/lib/apt/lists/* get-pip.py && \
  python -m pip install --no-cache-dir --upgrade pip && \
  python -m pip install --no-cache-dir wheel

USER worker
WORKDIR /home/worker
RUN mkdir models
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir --no-warn-script-location -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu118
COPY src src
CMD ["python", "src/cli.py"]
