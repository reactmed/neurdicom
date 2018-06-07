FROM python:3
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
RUN pip install git+git://github.com/pydicom/pydicom.git
RUN pip install git+git://github.com/pydicom/pynetdicom3.git
ADD . /code/
CMD python manage.py migrate
CMD python manage.py clear_dicom
CMD python manage.py store_dicom /images
EXPOSE 8080
ENTRYPOINT ["python", "app.py"]