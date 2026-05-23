import Link from "next/link";
import { Heart, Users, MapPin, Shield, Zap, Star } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "1v1, 2v2 & Groupes",
    desc: "Date en duo, double date ou en groupe. À toi de choisir le format qui te correspond.",
    color: "text-coral",
    bg: "bg-coral/10",
  },
  {
    icon: MapPin,
    title: "100% La Réunion",
    desc: "Des profils proches de chez toi, dans ton quartier, ta ville. Rencontres locales garanties.",
    color: "text-ocean",
    bg: "bg-ocean/10",
  },
  {
    icon: Shield,
    title: "Messages chiffrés E2EE",
    desc: "Tes conversations sont chiffrées de bout en bout. Personne d'autre ne peut les lire.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Zap,
    title: "Swipe & Match",
    desc: "Interface style Tinder. Swipe à gauche ou à droite, matche, discute.",
    color: "text-volcano",
    bg: "bg-volcano/10",
  },
  {
    icon: Users,
    title: "Événements & Sorties",
    desc: "Crée ou rejoins des événements : randos, restos, plages, soirées à La Réunion.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Star,
    title: "Super Like",
    desc: "Montre vraiment ton intérêt avec un Super Like. Sois mis en avant dans leur stack.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

const stats = [
  { value: "100%", label: "Local – La Réunion" },
  { value: "E2EE", label: "Messages chiffrés" },
  { value: "4", label: "Modes de rencontre" },
  { value: "0€", label: "Gratuit pour commencer" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral to-volcano flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">DateRéunion</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gradient-to-r from-coral to-volcano text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-coral/10 text-coral border border-coral/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span>🌺</span>
            <span>Made in La Réunion</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mb-6 leading-tight">
            Les rencontres{" "}
            <span className="gradient-text">autrement</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            DateRéunion, c&apos;est la première app de rencontres et dates en groupe
            de l&apos;île. 1v1, double date, groupes — choisis ton format, rencontre
            des gens près de chez toi.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-coral to-volcano text-white font-semibold text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-coral/30"
            >
              <Heart className="w-5 h-5" />
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold text-lg px-8 py-4 rounded-2xl hover:bg-muted transition-all"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-16 relative">
            <div className="w-full max-w-sm mx-auto aspect-[9/16] max-h-[520px] rounded-3xl bg-gradient-to-br from-coral/20 via-volcano/10 to-ocean/20 border border-border relative overflow-hidden shadow-2xl">
              {/* Mock swipe card */}
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-b from-transparent to-black/60 z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-coral/30 to-ocean/30" />
              {/* Mock profile info */}
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <div className="font-bold text-2xl">Léa, 24</div>
                <div className="text-white/80 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> Saint-Denis · 2 km
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs">💑 1v1</span>
                  <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs">👫👫 2v2</span>
                </div>
              </div>
              {/* Action buttons mock */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl border-2 border-red-200 animate-float" style={{animationDelay: '0.2s'}}>✗</div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-volcano shadow-xl flex items-center justify-center text-white">
                  <Heart className="w-7 h-7 fill-white" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl border-2 border-yellow-200 animate-float" style={{animationDelay: '0.4s'}}>⭐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-4 bg-muted/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4">Tout ce qu&apos;il te faut</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une app pensée pour La Réunion, avec toutes les fonctionnalités
              pour rencontrer des gens en vrai.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-coral/10 via-volcano/5 to-ocean/10 border border-coral/20 rounded-3xl p-12">
          <div className="text-5xl mb-6">🌺</div>
          <h2 className="text-3xl font-extrabold mb-4">Prêt à rencontrer quelqu&apos;un ?</h2>
          <p className="text-muted-foreground mb-8">
            Rejoins des centaines de Réunionnais qui cherchent des dates authentiques.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-coral to-volcano text-white font-semibold text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
          >
            <Heart className="w-5 h-5" />
            Créer mon profil — C&apos;est gratuit
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-coral to-volcano flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-semibold">DateRéunion</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 DateRéunion · Fait avec ❤️ à La Réunion 🇷🇪
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">CGU</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
