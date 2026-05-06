import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Equilibra — Finanzas personales, sin fricción",
  description:
    "Registra ingresos y gastos en segundos, obtén balances claros por mes y toma decisiones informadas.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-equilibra.svg"
              alt="Equilibra"
              width={32}
              height={32}
            />
            <span className="font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Equilibra
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-border hover:border-border/80 hover:bg-secondary text-muted-foreground text-sm transition-colors"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 items-center gap-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
                Controla tus finanzas{" "}
                <span className="text-primary">sin fricción</span>
              </h1>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Registra ingresos y gastos en segundos, obtén balances claros
                por mes y toma decisiones informadas. Equilibra está diseñado
                para ser rápido, simple y seguro.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/login?signup=1"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border hover:bg-secondary text-foreground font-medium transition-colors"
                >
                  Crear cuenta
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                  Datos en Supabase
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  Despliegue en Vercel
                </div>
              </div>
            </div>

            {/* Mock dashboard card */}
            <div className="relative">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo-equilibra.svg"
                    alt="Equilibra"
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Resumen del mes
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      $ 3,245,100
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-secondary p-3">
                    <p className="text-muted-foreground">Ingresos</p>
                    <p className="text-accent text-lg font-semibold">
                      $ 5,200,000
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary p-3">
                    <p className="text-muted-foreground">Gastos</p>
                    <p className="text-destructive text-lg font-semibold">
                      $ 1,954,900
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground text-xs">
                  *Datos de ejemplo
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16 border-t border-border bg-secondary/30">
          <div className="max-w-[1100px] mx-auto px-5 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border p-6 bg-card shadow-sm">
              <h3 className="font-semibold text-foreground">Registro ágil</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Añade ingresos y gastos en segundos con categorías y
                descripciones.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-6 bg-card shadow-sm">
              <h3 className="font-semibold text-foreground">Balance claro</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Visualiza tu balance mensual y tendencia para decisiones
                informadas.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-6 bg-card shadow-sm">
              <h3 className="font-semibold text-foreground">Tu data, segura</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Autenticación con Supabase y despliegue seguro en Vercel.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16">
          <div className="max-w-[1100px] mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Empieza a equilibrar tus finanzas hoy
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Crea tu cuenta gratis y lleva el control de tus números con un
              flujo simple, rápido y agradable.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/login?signup=1"
                className="px-5 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-lg shadow-accent/20 transition-colors"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl border border-border hover:bg-secondary text-foreground font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50">
        <div className="max-w-[1100px] mx-auto px-5 py-8 text-center text-xs text-muted-foreground">
          © 2025 Equilibra — Diseñado por Digital Workflows®
        </div>
      </footer>

      <Script id="chatwoot-widget" strategy="afterInteractive">
        {`(function(d,t) {
          var BASE_URL="https://instancia-n8n-chatwoot.xxhqsu.easypanel.host";
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: 'hNikf8s4J6L9vZwp6FcCfSHt',
              baseUrl: BASE_URL
            })
          }
        })(document,"script");`}
      </Script>
    </div>
  );
}
