// todo: split to modules

const ROOT = process.env.REACT_APP_BACK_URL
const ACTIONS = `${ROOT}/bench/`
const SUPPORT = `${ROOT}/support/`

const toJson = res => res.ok ? res.json() : Promise.reject(res)

export default {

  getInstances: () => fetch(
    `${SUPPORT}instances/`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  ).then(toJson),

  getConsumers: () => fetch(
    `${SUPPORT}consumers/`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(toJson),

  getFormats: () => fetch(
    `${SUPPORT}formats/`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  ).then(toJson),

  bench: ({
            connectionUrl,
            queries = [],
            consumer = 'FS',
            format = 'CSV',
            consumerParams = '',
            saveBetter = false,
          }) => fetch(
    ACTIONS,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectionUrl,
        queries,
        consumer,
        format,
        consumerParams,
        saveBetter
      })
    }
  ).then(toJson)
}
