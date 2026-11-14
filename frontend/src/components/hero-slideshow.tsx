"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { unsplashPhotoUrl } from "@/lib/event-photos";

/** Generic event photos from Unsplash, shown one after another behind the hero title. */
const SLIDES = [
  { id: "1540575467063-178a50c2df87", label: "Conference audience" },
  { id: "1505373877841-8d25f7d46678", label: "Presentation on stage" },
  { id: "1475721027785-f74eccf877e2", label: "Microphone in front of a crowd" },
  { id: "1559223607-a43c990c692c", label: "Students at a workshop" },
  { id: "1492684223066-81342ee5ff30", label: "Confetti at a concert" },
];

const SLIDE_DURATION_MS = 5000;

/** Full-width hero card: cross-fading photo slideshow with a single large title on top. */
export function HeroSlideshow({ title }: { title: string }) {
  const [current, setCurrent] = useState(0);

  // Restarting the timer whenever the slide changes means a dot click gets a full 5 s too.
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrent((index) => (index + 1) % SLIDES.length), SLIDE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  return (
    <section className="relative isolate grid min-h-[22rem] place-items-center overflow-hidden rounded-3xl px-6 shadow-lg sm:min-h-[28rem]">
      {SLIDES.map((slide, index) => (
        <Image
          key={slide.id}
          src={unsplashPhotoUrl(slide.id)}
          alt=""
          fill
          preload={index === 0}
          sizes="(min-width: 1152px) 1104px, 100vw"
          className={`-z-20 object-cover transition-[opacity,scale] duration-1000 ease-in-out motion-reduce:transition-none ${
            index === current ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}
      {/* Navy overlay keeps the white title readable on any photo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/90 via-navy/55 to-navy/30" aria-hidden="true" />

      <h1 className="max-w-3xl text-center text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
        {title}
      </h1>

      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Show photo ${index + 1}: ${slide.label}`}
            aria-current={index === current}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              index === current ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
