export default {
  CONSUMER: ['EMAIL', 'SMB', 'SFTP', 'FS'],
  FORMAT: ['CSV', 'JSON', 'XML'],

  bench: (
    connectionUrl, queries = [],
    consumer = 'FS',
    format = 'CSV',
    consumerParams = '',
    saveBetter = false,
  ) => fetch(
    `${process.env.BACK_URL}/bench/`,
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
  )
}
