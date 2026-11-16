import type { Organization } from "@/lib/types";

/** Banner gradients in the navy family; each organization gets one by id so cards stay distinguishable. */
const BANNER_GRADIENTS = [
  "from-navy to-[#2f5d8a]",
  "from-[#123a4a] to-[#2c7a7b]",
  "from-[#1f2a5c] to-[#5b5fa8]",
  "from-[#1b2b44] to-[#4a6a8f]",
];

/** The coloured banner at the top of an organization card, with the initial as avatar. */
export function OrganizationBanner({ organization }: { organization: Organization }) {
  const gradient = BANNER_GRADIENTS[organization.id % BANNER_GRADIENTS.length];
  const grayscale = organization.status === "SUSPENDED" ? "grayscale" : "";
  const initial = organization.name.charAt(0);

  return (
    <>
      {/* Banner with a large faded initial as decoration */}
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${gradient} ${grayscale}`} aria-hidden="true">
        <span className="absolute -right-3 -top-8 select-none text-[9rem] font-black leading-none text-white/10 transition-transform duration-500 group-hover:scale-110">
          {initial}
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.18),transparent_55%)]" />
      </div>

      {/* Avatar overlapping the banner */}
      <span
        className={`absolute left-5 top-14 grid size-16 place-items-center rounded-2xl border-4 border-surface bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-md ${grayscale}`}
        aria-hidden="true"
      >
        {initial}
      </span>
    </>
  );
}
