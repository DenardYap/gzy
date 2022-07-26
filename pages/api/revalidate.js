export default async function handler(req, res) {
  // as of now (7/26/2022) this doesn't seem to be supported by AWS, though this is
  // the best of both world for getStaticProps and getServerSideProps, in the future
  // when it's supported it will be a nice feature to have

  // Check for secret to confirm this is a valid request
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    if (req.body.operation == "1") {
      console.log("revalidating...");
      await res.revalidate("/");
      await res.revalidate("/product");
      await res.revalidate(`/product/${req.body.id}`);
      await res.revalidate("/dashboard/upload/delete");
      await res.revalidate("/dashboard/upload/edit");
      console.log("Done revalidating!");
    } else {
      console.log("revalidating2...");
      await res.revalidate(`/order/${req.body.id}`);
    }
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    console.log("Error!:", err);
    return res.status(500).json({ message: err });
  }
}
