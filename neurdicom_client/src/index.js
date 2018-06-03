import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {localeReducer as locale, initialize, addTranslation} from 'react-localize-redux';
import {BrowserRouter, Route} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import StudiesPage from "./pages/StudiesPage";
import StudySeriesPage from "./pages/StudySeriesPage";
import 'semantic-ui-css/semantic.css';
import PatientsPage from "./pages/PatientsPage";
import PluginsPage from "./pages/PluginsPage";
import SeriesViewerPage from "./pages/SeriesViewerPage";
import LoginPage from "./pages/LoginPage";
import DicomNodesPage from "./pages/DicomNodesPage";
import UploadDicomPage from "./pages/UploadDicomPage";
import ProcessingPage from "./pages/ProcessingPage";
import PatientStudiesPage from "./pages/PatientStudies";

const store = createStore(combineReducers({locale}));

const languages = [
    {name: 'English', code: 'en'},
    {name: 'Русский', code: 'ru'}
];

const translations = {
    patient: {
        id: ['Patient ID', 'Идентификатор пациента'],
        patient: ['Patient', 'Пациент'],
        patients: ['Patients', 'Пациенты'],
        name: ['Patient Name', 'ФИО'],
        age: ['Patient Age', 'Возраст'],
        birthdate: ['Patient Birthdate', 'Дата рождения'],
        gender: ['Patient Gender', 'Пол'],
        anonymized: ['Anonymized', 'Анонимизирован'],
        imagesCount: ['Images Count', 'Кол-во снимков']
    },

    study: {
        study: ['Study', 'Обследование'],
        studies: ['Studies', 'Обследования'],
        id: ['Study ID', 'Идентификатор Обследования'],
        date: ['Study Date', 'Дата проведения'],
        description: ['Study Description', 'Описание'],
        modality: ['Modality', 'Диагностическое оборудование'],
        imagesCount: ['Images Count', 'Кол-во изображений'],
        referringPhysician: ['Referring Physician', 'Главный врач'],

    },

    series: {
        series: ['Series', 'Серия обследований'],
        description: ['Description', 'Описание'],
        modality: ['Modality', 'Диагностическое оборудование'],
        bodyPartExamined: ['Body Part Examined', 'Часть тела'],
        patientPosition: ['Patient Position', 'Положение пациента'],
        seriesNumber: ['Series Number', 'Номер серии']
    },

    instance: ['Instance', 'Изображение'],
    plugin: {
        plugin: ['Plugin', 'Плагин'],
        plugins: ['Plugins', 'Плагины'],
        name: ['Name', 'Название'],
        author: ['Author', 'Автор'],
        version: ['Version', 'Версия'],
        modalities: ['Modalities', 'Тип диагностики'],
        tags: ['Tags', 'Теги']
    },

    dicomNode: {
        dicomNodes: ['DICOM Servers', 'Сервера DICOM'],
        name: ['Name', 'Название'],
        protocol: ['Protocol', 'Протокол'],
        aet: ['AET', 'AET'],
        remoteAet: ['Remote AET', 'Удаленный AET'],
        remoteHost: ['Remote Host', 'Удаленный хост'],
        remotePort: ['Remote Port', 'Удаленный порт'],
        add: ['Add', 'Добавить'],
        echo: ['Echo', 'Проверить доступность']
    },

    uploadDicom: {
        uploadDicom: ['Upload images', 'Загрузить изображения']
    },

    auth: {
        logOut: ['Log Out', 'Выйти']
    },

    translation: {
        language: ['Language', 'Язык'],
        changeLanguage: ['Change language', 'Сменить язык']
    },
    open: ['Open', 'Открыть'],
    delete: ['Delete', 'Удалить'],
    install: ['Install', 'Установить'],
    success: ['Success', 'Успешно'],
    fail: ['Fail', 'Неудачно'],
    imagesCount: ['Images Count', 'Кол-во изображений']
};

store.dispatch(initialize(languages, {defaultLanguage: 'ru'}));
store.dispatch(addTranslation(translations));

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div>
                <Route exact path='/studies' component={StudiesPage}/>
                <Route path='/patient/:id/studies' component={PatientStudiesPage}/>
                <Route path='/patients' component={PatientsPage}/>
                <Route path='/studies/:id' component={StudySeriesPage}/>
                <Route path='/plugins' component={PluginsPage}/>
                <Route path='/dicom_nodes' component={DicomNodesPage}/>
                <Route path='/series/:id' component={SeriesViewerPage}/>
                <Route path='/remote/:serverId/series/:id' component={SeriesViewerPage}/>
                <Route path='/dicom/upload' component={UploadDicomPage}/>
                <Route path='/instances/:instanceId/process/:pluginId' component={ProcessingPage}/>
                <Route path='/remote/:serverId/instances/:instanceId/process/:pluginId' component={ProcessingPage}/>
                <Route exact path='/' component={StudiesPage}/>
            </div>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
