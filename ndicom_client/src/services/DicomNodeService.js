import * as queryString from 'query-string';

const DICOM_NODES_ROOT_URL = '/api/dicom_nodes';

export default class DicomNodeService {
    static findDicomNodes(f, params = {}) {
        fetch(
            `${DICOM_NODES_ROOT_URL}?${queryString.stringify(params)}`
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