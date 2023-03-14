```bash
# install deps
choco install python3 --version 3.10.8
python.exe -m pip install --upgrade pip
pip install wheel
pip install virtualenv

cd worker
virtualenv env
source env/Scripts/activate
./install.sh

# start cli
SERVER=ws://localhost:8081/worker ./start.sh

# build gui
./build.sh
```
