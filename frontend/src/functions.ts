export function getBaseURL() {
    return process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4274/api'
}