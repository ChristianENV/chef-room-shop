const query = `
  query {
    productBySlug(slug: "demo-filipina-clasica") {
      slug
      variants { color { name slug hexCode } }
    }
  }
`
const res = await fetch('http://localhost:3000/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
})
console.log(JSON.stringify(await res.json(), null, 2))
