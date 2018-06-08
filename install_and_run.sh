#!/usr/bin/env bash
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[1;36m'
NC='\033[0m'

OS="$(uname)"

logInfo(){
  echo -e "${CYAN}`date "+%Y-%m-%d %H:%M:%S"`${NC} ${BLUE}[INFO]${NC}: $1"
}

logInfoStep(){
  echo -e "${CYAN}`date "+%Y-%m-%d %H:%M:%S"`${NC} ${BLUE}[INFO]${NC}: $1 ${GREEN}[OK]${NC}"
}

logErr(){
  echo -e "${CYAN}`date "+%Y-%m-%d %H:%M:%S"`${NC} ${RED}[ERR]${NC}: $1"
}

logWarn(){
  echo -e "${CYAN}`date "+%Y-%m-%d %H:%M:%S"`${NC} ${YELLOW}[WARN]${NC}: $1"
}
#
# buildAndRun(){
#   if [[ $1 -eq 1]]; then
#     docker-compose up --build
#   else
#     docker-compose up
#   fi
# }

# buildAndRunWithCUDA(){
#
#   if [[ $1 -eq 1]]; then
#     mkdir venv
#     virtualenv venv --no-site-packages
#     logInfo "Activate virtual env"
#     source venv/bin/activate
#
#     logInfo "Install requirements"
#     pip install -r requirements.txt
#     pip install git+git://github.com/pydicom/pydicom.git
#     pip install git+git://github.com/pydicom/pynetdicom3.git
#     logInfo "Start Docker container"
#     docker-compose up --build &
#
#     logInfo "Waiting PostgreSQL to launch on 5432..."
#
#     while ! nc -z localhost 5432; do
#       sleep 0.1
#     done
#
#     logInfo "PostgreSQL launched"
#
#     sleep 10
#     logInfo "Migrate database"
#     python ./manage.py migrate
#
#     logInfo "Store DICOM images"
#     python ./manage.py clear_dicom
#     python ./manage.py store_dicom ../images
#     #python ./manage.py install_plugins --mode=PYPI ndicom_kmeans ndicom_cuda_kmeans ndicom_fcm ndicom_thresholding \
#     #    ndicom_region_growing ndicom_meanshift ndicom_gauss_kernel_kmeans ndicom_improved_kmeans ndicom_gaussian_mixture --clear --upgrade
#     python app.py &
#
#     while ! nc -z localhost 8080; do
#       sleep 0.1
#     done
#
#     sleep 10
#
#     cd ../ndicom_client
#     rm -rf build
#     npm run build
#     npm install -g serve
#     server -s build
#     docker-compose up --build
#   else
#     logInfo "Start Docker container"
#     docker-compose up --build &
#
#     logInfo "Waiting PostgreSQL to launch on 5432..."
#
#     while ! nc -z localhost 5432; do
#       sleep 0.1
#     done
#
#     logInfo "PostgreSQL launched"
#
#     sleep 10
#     python app.py &
#
#     while ! nc -z localhost 8080; do
#       sleep 0.1
#     done
#
#     sleep 10
#   fi
# }

logInfo "Verification all required components"

# Check if python3 is istalled
if command -v python3 &>/dev/null; then
    logInfoStep "Step 1/3 - Python 3 is installed"
else
    logErr "Python 3 is not installed"
    exit -1
fi

# Check if Docker is installed
if command -v docker &>/dev/null; then
  logInfoStep "Step 2/3 - Docker is installed"
else
  logErr "Docker is not installed"
  exit -1
fi

# Check if Git is installed

if command -v git &>/dev/null; then
  logInfoStep "Step 3/3 - Git is installed"
else
  logErr "Git is not installed"
  exit -1
fi

use_cuda=0
# Use CUDA?
if command -v whiptail &>/dev/null; then
  if whiptail --title  "Use CUDA" --yesno  "Would you like to use NVIDIA CUDA?" 10 60; then
    logWarn "Application server can not be run inside Docker container"
    use_cuda=1
  fi
else
  read -p "Would you like to use NVIDIA CUDA [Y/N]? " use_cuda
  if [[ "$use_cuda" == "Y" ]]; then
    logWarn "Application server can not be run inside Docker container"
    use_cuda=1
  fi
fi

# Clone project if there is only build script
if command -v whiptail &>/dev/null; then
  if whiptail --title  "Install?" --yesno  "Would you like to clone application from repository?" 10 60; then
    git clone https://github.com/reactmed/neurdicom.git
    logInfo "Project cloned to local directory"
  fi
else
  read -p "Would you like to clone application from repository [Y/N]? " to_clone
  if [[ "$to_clone" == "Y" ]]; then
    git clone https://github.com/reactmed/neurdicom.git
    logInfo "Project cloned to local directory"
  fi
fi

cd neurdicom

to_install=0

#Install?
if command -v whiptail &>/dev/null; then
  if whiptail --title  "Install?" --yesno  "Would you like to install or only run?" 10 60; then
    logWarn "Application will be built again"
    to_install=1
  fi
else
  read -p "Would you like to install or only run? " to_install
  if [[ "$to_install" == "Y" ]]; then
    logWarn "Application will be built again"
    to_install=1
  fi
fi

logInfo "Running application"
if [[ $use_cuda -eq 1 ]]; then
  logInfo "CUDA installed"
else
  if [[ $to_install -eq 1]]; then
    docker-compose up --build
  else
    docker-compose up
  fi
fi
