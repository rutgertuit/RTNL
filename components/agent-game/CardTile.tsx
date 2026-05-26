"use client";

import type { FocusEventHandler, MouseEventHandler } from "react";
import type { Card } from "@/app/technical/agent-game/cards";

interface CardTileProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
  onSelect?(): void;
  onPlay?(): void;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
}

export function CardTile({
  card,
  selected,
  disabled,
  onSelect,
  onPlay,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: CardTileProps) {
  const trigger = () => {
    if (disabled) return;
    if (selected) onPlay?.();
    else onSelect?.();
  };
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={[
        "sim-card",
        `sim-card--${card.class}`,
        selected ? "is-selected" : "",
        disabled ? "is-disabled" : "",
      ].filter(Boolean).join(" ")}
      onClick={trigger}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={`${card.name}, $${card.cost.toLocaleString()}. ${card.rulesText}`}
      aria-pressed={selected ? true : undefined}
    >
      <header className="sim-card__head">
        <h3 className="sim-card__name">{card.name}</h3>
        <span className="sim-card__cost">${(card.cost / 1000).toFixed(card.cost % 1000 === 0 ? 0 : 1)}k</span>
      </header>
      <p className="sim-card__rules">{card.rulesText}</p>
      <p className="sim-card__flavor">{card.flavor}</p>
      {selected && !disabled && (
        <button
          type="button"
          className="sim-card__play"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          Play this card →
        </button>
      )}
    </div>
  );
}
