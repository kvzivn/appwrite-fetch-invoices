export default async ({ res, log, error }) => {
  async function fetchInvoices(pageParam = {}) {
    let invoices = []
    let hasMore = true

    while (hasMore) {
      let query = `https://api.eukapay.com/invoices?limit=20`

      if (pageParam.startingAfter) {
        query += `&starting_after=${pageParam.startingAfter}`
      }

      const response = await fetch(query, {
        headers: {
          "x-api-key": process.env.EUKAPAY_API_KEY,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      invoices = invoices.concat(data.data)
      hasMore = data.has_more

      if (hasMore) {
        pageParam.startingAfter = data.data[data.data.length - 1].code
      }
    }

    log("Fetched invoices:", invoices.length)
    return invoices
  }

  try {
    const allInvoices = await fetchInvoices()
    return res.json(allInvoices)
  } catch (err) {
    error("Error fetching data from EUKAPAY API:", err.message)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
