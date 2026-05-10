"use client";

import { useState } from "react";
import { WrappedCard } from "./WrappedCard";
import { Button } from "@/components/ui/button";
import type { UserInsight } from "@/lib/types";

interface WrappedStoryProps {
  insight: UserInsight;
}

const PERSONA_EMOJI: Record<string, string> = {
  "Night Owl Listener": "🦉",
  "Loop Addict": "🔁",
  "Genre Explorer": "🗺️",
  "Loyal Fan": "🏆",
  "Consistent Listener": "📅",
  "Casual Listener": "🎵",
};

export function WrappedStory({ insight }: WrappedStoryProps) {
  const [current, setCurrent] = useState(0);

  const cards = [
    {
      label: "Total Plays",
      value: String(insight.total_plays),
      emoji: "🎧",
      subLabel: `${insight.unique_tracks} unique tracks`,
      gradient: "from-green-950 to-green-900",
    },
    {
      label: "Your #1 Artist",
      value: insight.top_artist,
      emoji: "🎤",
      subLabel: "You couldn't get enough",
      gradient: "from-purple-950 to-purple-900",
    },
    {
      label: "Most Played Track",
      value: insight.top_track,
      emoji: "🎶",
      subLabel: "On repeat",
      gradient: "from-blue-950 to-blue-900",
    },
    {
      label: "Peak Listening Hour",
      value: `${insight.peak_hour}:00`,
      emoji: "🕐",
      subLabel: "Your favorite time to listen",
      gradient: "from-orange-950 to-orange-900",
    },
    {
      label: "Your Persona",
      value: insight.persona,
      emoji: PERSONA_EMOJI[insight.persona] ?? "🎵",
      subLabel: `Repeat score: ${Number(insight.repeat_score).toFixed(2)}`,
      gradient: "from-pink-950 to-pink-900",
    },
    {
      label: "Your 2024 Summary",
      value: "That's a wrap!",
      emoji: "🎁",
      subLabel: insight.summary_text,
      gradient: "from-zinc-900 to-zinc-800",
    },
  ];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(cards.length - 1, c + 1));

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Cards container */}
      <div className="relative w-full max-w-sm" style={{ minHeight: "480px" }}>
        {cards.map((card, i) => (
          <WrappedCard
            key={i}
            index={i}
            total={cards.length}
            active={i === current}
            label={card.label}
            value={card.value}
            subLabel={card.subLabel}
            emoji={card.emoji}
            gradient={card.gradient}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={prev}
          disabled={current === 0}
          size="sm"
        >
          ← Prev
        </Button>
        <span className="text-zinc-500 text-sm">
          {current + 1} / {cards.length}
        </span>
        <Button
          variant="outline"
          onClick={next}
          disabled={current === cards.length - 1}
          size="sm"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
