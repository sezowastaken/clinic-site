import { Link } from "react-router-dom";

/** Basit ikonlar (inline SVG) – About sayfasında listede kullanılıyor */
function Icon({ name, className = "h-5 w-5" }) {
  const common = { className, fill: "currentColor", viewBox: "0 0 24 24" };
  if (name === "school") return <svg {...common}><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zM3 13v4l9 5 9-5v-4l-9 5-9-5z"/></svg>;
  if (name === "shield") return <svg {...common}><path d="m12 2 7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z"/></svg>;
  if (name === "award")  return <svg {...common}><path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14 4 6-4-2-4 2 4-6Z"/></svg>;
  if (name === "group")  return <svg {...common}><path d="M16 11c1.66 0 2.99-1.57 2.99-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"/></svg>;
  return null;
}

/** Logoların boyutunu tek yerden yönetmek için */
const LOGO_SIZE = "h-16 sm:h-20 md:h-20";

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Profil foto */}
          <div className="group relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-lg">
            <img
              src="/assets/general/rabiyebulan.jpg"
              alt="Dr. Rabiye Bulan portre"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[var(--color-border)]/70" />
          </div>

          {/* İsim & unvan */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Dr. Rabiye Bulan</h1>
            <p className="mt-2 text-lg text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
              Board-Sertifikalı Estetik Cerrah
            </p>
          </div>
        </div>
      </section>

      {/* Hakkımda – (metin güncellendi) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-3xl font-bold tracking-tight text-center">Hakkımda</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-8 md:gap-12 text-base leading-relaxed text-[color-mix(in srgb, var(--color-text) 85%, transparent)]">
          <p>
            Tıp eğitimimi <strong>İstanbul Tıp Fakültesi</strong>’nde tamamladıktan sonra,
            <strong> Cerrahpaşa Tıp Fakültesi</strong>’nde Plastik, Rekonstrüktif ve Estetik Cerrahi
            ihtisasımı bitirdim. Kariyerim boyunca hem fonksiyonel hem de estetik sonuçları bir araya getiren,
            <em> doğal ve yüz–vücut uyumunu gözeten</em> bir yaklaşım benimsedim. Hastalarımın güvenliği,
            konforu ve beklentilerinin gerçekçi şekilde planlanması benim için her zaman önceliktir.
          </p>
          <p>
            Ulusal ve uluslararası derneklerdeki üyeliklerim ve düzenli katıldığım bilimsel toplantılar sayesinde
            güncel teknikleri yakından takip ediyor, kliniğimde <em>kişiye özel</em> tedavi planları oluşturuyorum.
            İlk görüşmeden itibaren tüm süreci şeffaf biçimde anlatarak sorularınızı yanıtlıyor, kararınızı
            <strong> bilgi ve güvenle</strong> vermenizi hedefliyorum. Amacım, sizi olduğunuz kişiden uzaklaştırmak
            değil; <strong>en doğal ve en iyi halinize</strong> ulaşmanıza yardımcı olmak.
          </p>
        </div>
      </section>

      {/* Eğitim & Yetkinlikler – (bu blok aynen korunuyor) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-[var(--color-secondary)]/60 border border-[var(--color-border)] shadow-sm p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Eğitim & Yetkinlikler</h2>

          <ul className="mt-8 space-y-6 max-w-3xl mx-auto">
            {[
              { icon: "school", title: "İstanbul Tıp Fakültesi", desc: "Tıp Doktoru (MD)" },
              { icon: "shield", title: "Cerrahpaşa Tıp Fakültesi", desc: "Plastik ve Rekonstrüktif Cerrahi İhtisası" },
              { icon: "award",  title: "American Board of Plastic Surgery", desc: "Board Sertifikalı" },
              { icon: "group",  title: "Profesyonel Üyelikler", desc: "Türk Plastik Rekonstrüktif ve Estetik Cerrahi Derneği" },
            ].map((item) => (
              <li
                key={item.title}
                className="group flex items-start gap-4 rounded-xl p-4 transition hover:bg-[var(--color-bg)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm mt-0.5 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Logolar – boyut büyütüldü */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-12 opacity-90">
            {[
              { src: "/assets/general/istanbul-tıp.png", alt: "İstanbul Tıp" },
              { src: "/assets/general/cerrahpasa.png", alt: "Cerrahpaşa" },
              { src: "/assets/general/asps.png", alt: "ASPS" },
              { src: "/assets/general/plastik-cerrahi-dernegi.png", alt: "Dernek" },
            ].map((b) => (
              <img
                key={b.src}
                src={b.src}
                alt={b.alt}
                className={`${LOGO_SIZE} grayscale opacity-80 transition hover:opacity-100 hover:grayscale-0`}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Hazır mısınız?</h2>
        <p className="mt-2 text-[color-mix(in srgb, var(--color-text) 70%, transparent)]">
          Hedeflerinizi ve birlikte nasıl ilerleyebileceğimizi konuşalım. Bugün özel bir muayene randevusu planlayın.
        </p>
        <Link
          to="/randevu"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl px-6 font-semibold text-white bg-[var(--color-primary)] shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          Randevu Al
        </Link>
      </section>
    </>
  );
}
