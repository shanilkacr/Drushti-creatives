"use client";

import Image from "next/image";
import Link from "next/link";

type PortfolioCardProps = {
  name: string;
  client: string;
  image: string;
  href: string;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  borderless?: boolean;
};

export default function PortfolioCard({
  name,
  client,
  image,
  href,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
  borderless = false,
}: PortfolioCardProps) {
  const isExternal = /^https?:\/\//.test(href);

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-white transition-opacity duration-300 outline-none ${
        borderless ? "" : "border border-ink/5"
      } ${isDimmed ? "opacity-40" : "opacity-100"}`}
    >
      <Image
        src={image}
        alt={name}
        fill
        quality={85}
        className={`object-cover transition-transform duration-500 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      <div
        className={`absolute inset-x-3 bottom-3 rounded-2xl bg-white px-5 py-4 transition-all duration-300 ease-out ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h3 className="font-heading text-base font-semibold text-ink">{name}</h3>
        <p className="mt-0.5 text-xs text-ink/60">{client}</p>
      </div>
    </Link>
  );
}
