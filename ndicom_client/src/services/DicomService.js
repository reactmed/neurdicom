import * as queryString from 'query-string';

const PATIENTS_ROOT_URL = '/api/patients';
const STUDIES_ROOT_URL = '/api/studies';
const SERIES_ROOT_URL = '/api/series';
const INSTANCES_ROOT_URL = '/api/instances';

export default class DicomService {
    static findPatients(f, params = {}) {
        fetch(
            `${PATIENTS_ROOT_URL}?${queryString.stringify(params)}`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findStudies(f) {
        fetch(
            STUDIES_ROOT_URL
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findStudiesByPatient(f, patientId) {
        fetch(
            `/api/patients/${patientId}/studies`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findStudyById(studyId, f) {
        fetch(
            `${STUDIES_ROOT_URL}/${studyId}`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findSeries(f) {
        fetch(
            SERIES_ROOT_URL
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findInstances(f) {
        fetch(
            INSTANCES_ROOT_URL
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findStudiesByPatientId(patientId, f) {
        fetch(
            `${PATIENTS_ROOT_URL}/${patientId}/studies`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findSeriesByStudyId(studyId, f) {
        fetch(
            `${STUDIES_ROOT_URL}/${studyId}/series`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findInstancesBySeriesId(seriesId, f) {
        fetch(
            `${SERIES_ROOT_URL}/${seriesId}/instances`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findInstancesById(instanceId, f) {
        fetch(
            `${INSTANCES_ROOT_URL}/${instanceId}`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findTagsByInstanceId(instanceId, f) {
        fetch(
            `${INSTANCES_ROOT_URL}/${instanceId}/tags`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }
}