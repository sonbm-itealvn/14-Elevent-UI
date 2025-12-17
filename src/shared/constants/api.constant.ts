const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000;
const CONTENT_TYPE = {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    TEXT: 'text/plain',
    HTML: 'text/html',
    XML: 'application/xml',
    CSV: 'text/csv',
    PDF: 'application/pdf',
    IMAGE: 'image/jpeg',
    VIDEO: 'video/mp4',
    AUDIO: 'audio/mpeg',
}
const API_HEADERS = {
    'Content-Type': CONTENT_TYPE.JSON,
    'Accept': 'application/json',
}



export { API_BASE_URL, API_TIMEOUT, API_HEADERS, CONTENT_TYPE };