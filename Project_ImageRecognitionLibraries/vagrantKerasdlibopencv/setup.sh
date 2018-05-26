# !/bin/bash 
printf 'installing git and others \n'
sudo apt-get update -y
sudo apt-get install git-all -y

printf 'instaling bp \n'
git clone -b OV2/kerasdlibopencv_docker_files --single-branch https://8871491ddbac2e2e85fe6c79e4235f3ff999a47d@github.com/JonathanCa97/Bachelorproef.git
cd ./Bachelorproef

printf 'installing python 3 \n'
sudo apt-get install python -y
sudo apt-get install python-pip -y
sudo apt-get install python-dev -y
pip install -r --user requirements.txt
sudo apt-get install python-tk
sudo pip install cmake
pip install --user dlib

printf 'start experiments \n'
mkdir KERASDLIBOPENCV_RESULTS