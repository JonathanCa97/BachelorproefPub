# !/bin/bash 
printf 'installing git and others \n'
sudo apt-get update -y
sudo apt-get install git-all -y
sudo apt-get build-essential -y
sudo apt-get install cmake -y
sudo apt-get install -y gfortran wget curl graphicsmagick libgraphicsmagick1-dev libatlas-dev libavcodec-dev libavformat-dev libgtk2.0-dev libjpeg-dev liblapack-dev libswscale-dev pkg-config python3-dev python3-numpy -y
sudo apt-get install software-properties-common zip -y
sudo apt-get install libx11-dev libatlas-base-dev -y
sudo apt-get install libgtk-3-dev libboost-python-dev -y
sudo apt-get clean
printf 'installing python 3 \n'
sudo apt-get install python3 -y
sudo apt-get install python3-pip -y
# sudo pip3 install face_recognition
printf 'instaling bp \n'
git clone -b OV2/facerecognition_docker_files --single-branch https://8871491ddbac2e2e85fe6c79e4235f3ff999a47d@github.com/JonathanCa97/Bachelorproef.git

printf 'install dlib \n'
git clone https://github.com/davisking/dlib.git
cd dlib
mkdir build
cd build
cmake .. -DDLIB_USE_CUDA=0 -DUSE_AVX_INSTRUCTIONS=1
cmake --build .
cd ..
sudo python3 setup.py install --yes USE_AVX_INSTRUCTIONS --no DLIB_USE_CUDA
sudo pip3 install face_recognition

printf 'starting experiments \n'
cd Bachelorproef
mkdir FACERECOGNITION_RESULTS