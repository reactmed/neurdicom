#!/usr/bin/env bash

echo "Activate virtual env"
source venv/bin/activate

echo "Install requirements"
pip install -r requirements.txt
pip install git+git://github.com/pydicom/pydicom.git
pip install git+git://github.com/pydicom/pynetdicom3.git
echo "Start Docker container"
docker-compose up --build &

echo "Waiting PostgreSQL to launch on 8080..."

while ! nc -z localhost 5432; do
  sleep 0.1
done

echo "PostgreSQL launched"

sleep 10
echo "Migrate database"
python ./manage.py migrate

echo "Store DICOM images"
python ./manage.py clear_dicom
python ./manage.py store_dicom ../images
#python ./manage.py install_plugins --mode=PYPI ndicom_kmeans ndicom_cuda_kmeans ndicom_fcm ndicom_thresholding \
#    ndicom_region_growing ndicom_meanshift ndicom_gauss_kernel_kmeans ndicom_improved_kmeans ndicom_gaussian_mixture --clear --upgrade
python app.py &


while ! nc -z localhost 8080; do
  sleep 0.1
done

sleep 10

cd ../ndicom_client
rm -rf build
npm run build
npm install -g serve
server -s build

