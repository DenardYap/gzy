export default async function handler(req, res) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    if (req.query.operation == "1") {
      await res.revalidate("/");
      await res.revalidate("/product");
      await res.revalidate("/product/[id]");
      await res.revalidate("/dashboard/delete");
      await res.revalidate("/dashboard/edit");
    } else {
      await res.revalidate("/order/[id]");
    }
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating");
  }
}
