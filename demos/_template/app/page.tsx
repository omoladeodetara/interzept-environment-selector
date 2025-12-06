export default function Home() {
  return (
    <div className="container py-12">
      <section className="text-center py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Your Product
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          This is a demo template for Last Price integration. Replace this with your actual product.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            View Pricing
          </a>
          <a
            href="/features"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Learn More
          </a>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-8">How Last Price Works Here</h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">1️⃣</div>
            <h3 className="font-semibold mb-2">User Visits Pricing</h3>
            <p className="text-sm text-muted-foreground">
              When a user views the pricing page, Last Price assigns them to a price variant.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">2️⃣</div>
            <h3 className="font-semibold mb-2">Dynamic Price Display</h3>
            <p className="text-sm text-muted-foreground">
              The price shown is determined by the experiment variant (e.g., $19 vs $29).
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">3️⃣</div>
            <h3 className="font-semibold mb-2">Conversion Tracking</h3>
            <p className="text-sm text-muted-foreground">
              When the user purchases, Last Price tracks the conversion for analysis.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
