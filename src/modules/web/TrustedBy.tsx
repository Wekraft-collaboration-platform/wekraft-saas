"use client";

const TrustedBy = () => {
  return (
    <section className="w-full mt-12  mb-12 flex flex-col items-center gap-8 relative z-10">
      <p className="text-xs md:text-base text-neutral-400  font-sans tracking-wide uppercase">
        Trusted by teams and developers at
      </p>

      <div className="relative w-full max-w-6xl overflow-hidden py-6">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-linear-to-r from-black to-transparent pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-linear-to-l from-black to-transparent pointer-events-none" />

        <div className="flex animate-logo-marquee items-center w-max">
          {["set-1", "set-2"].map((setKey) => (
            <div
              key={setKey}
              className="flex gap-24 md:gap-32 items-center shrink-0 pr-24 md:pr-32"
            >
              {/* Wipro */}
              <div className="opacity-55 hover:opacity-100 transition-opacity">
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  Wipro
                </span>
              </div>

              {/* VRSA Analytics */}
              <div className="opacity-55 hover:opacity-100 transition-opacity">
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  VRSA ANALYTICS
                </span>
              </div>

              {/* Tata */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity">
                <svg
                  className="h-7 w-7 md:h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="#d4d4d4"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Tata logo"
                >
                  <path d="M9.774 11.568c.193-1.322.168-2.013-1.768-1.906-2.223.124-4.476.265-7.849 1.027A5.63 5.63 0 0 0 0 12c0 1.52.618 2.99 1.787 4.254 1.06 1.144 2.556 2.095 4.326 2.752a15.48 15.48 0 0 0 2.014.588c.13-.527.959-3.907 1.616-7.823l.03-.202m14.07-.88c-3.372-.762-5.624-.902-7.846-1.026-1.937-.107-1.962.584-1.768 1.906l.046.298c.65 3.848 1.458 7.16 1.598 7.72C20.595 18.508 24 15.516 24 12c0-.443-.054-.88-.157-1.311m-.491-1.324a7.163 7.163 0 0 0-1.14-1.618c-1.06-1.144-2.555-2.095-4.325-2.752-1.784-.662-3.82-1.011-5.887-1.011-2.068 0-4.103.35-5.887 1.01-1.77.658-3.266 1.61-4.326 2.753A7.17 7.17 0 0 0 .648 9.366c2.304-.557 6.245-1.293 9.904-1.37.353-.008.596.105.756.307.196.248.18 1.128.175 1.522l-.104 10.18a18.507 18.507 0 0 0 1.244 0l-.104-10.18c-.005-.394-.02-1.274.175-1.522.16-.202.403-.315.756-.308 3.658.078 7.597.813 9.902 1.37z" />
                </svg>
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  Tata
                </span>
              </div>

              {/* Uber */}
              <div className="opacity-55 hover:opacity-100 transition-opacity">
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  Uber
                </span>
              </div>

              {/* Supabase */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity">
                <svg
                  className="h-7 w-7 md:h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="#d4d4d4"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Supabase logo"
                >
                  <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" />
                </svg>
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  Supabase
                </span>
              </div>

              {/* Vercel */}
              <div className="flex items-center gap-3 opacity-55 hover:opacity-100 transition-opacity">
                <svg
                  className="h-6 w-6 md:h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="#d4d4d4"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Vercel logo"
                >
                  <path d="m12 1.608 12 20.784H0Z" />
                </svg>
                <span className="text-neutral-400 text-xl md:text-2xl font-semibold tracking-tight">
                  Vercel
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-row items-center justify-center gap-6 w-full relative z-20">
        <a
          href="https://www.producthunt.com/products/wekraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-wekraft"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity duration-200"
          id="trustedby-product-hunt-badge"
        >
          <img
            alt="Wekraft - your project lives in Github , so should your workspace. | Product Hunt"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1165218&theme=light&t=1780813633054"
            width="250"
            height="54"
            className="w-[250px] h-[54px] object-contain"
          />
        </a>
        <a
          href="https://forg.to/products/wekraft"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity duration-200"
          id="trustedby-forg-badge"
        >
          <img
            src="https://forg.to/api/badges/launch-winner/wekraft?theme=light&shape=square&rank=1"
            alt="WeKraft - #1 on forg. on forg."
            height="54"
            className="h-[54px] w-auto object-contain"
          />
        </a>
      </div>
    </section>
  );
};

export default TrustedBy;
