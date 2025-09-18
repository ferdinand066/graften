import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 to-background">

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-foreground mb-6 sm:text-7xl">
            Digital Printing &<br />
            <span className="text-primary">Advertising Agency</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional digital printing services and creative advertising solutions in Olsztyn.
            Transform your ideas into stunning visual experiences that captivate your audience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session?.user ? (
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-4">
                  <Link href="/register">
                    Get Started Today
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary/5 rounded-xl p-8 border border-primary/10 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Digital Printing</h3>
              <p className="text-muted-foreground">
                High-quality digital printing for business cards, flyers, posters, and more.
                Fast turnaround with professional results.
              </p>
            </div>

            <div className="bg-primary/5 rounded-xl p-8 border border-primary/10 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Creative Design</h3>
              <p className="text-muted-foreground">
                Custom graphic design services for branding, marketing materials,
                and advertising campaigns that make an impact.
              </p>
            </div>

            <div className="bg-primary/5 rounded-xl p-8 border border-primary/10 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Advertising Solutions</h3>
              <p className="text-muted-foreground">
                Comprehensive advertising strategies from concept to execution.
                Digital and traditional advertising that drives results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-accent text-accent-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-4">
            Graften <span className="text-primary">Digital</span>
          </div>
          <p className="text-muted-foreground">
            Professional Digital Printing & Advertising Agency in Olsztyn
          </p>
        </div>
      </footer>
    </main>
  );
}
