import logo from "../../images/logo.png";
import logoRound from "../../images/logo-variants/logo-round.png";
import React from "react";
import "../../css/logo.css";

interface LogoProps {
  style?: React.CSSProperties;
  size?: string;
  className?: string;
  type?: "normal" | "round";
  /** Decorative by default; pass text when the logo is the only label. */
  alt?: string;
}

export default function Logo({
  style,
  size = "small",
  className = "",
  type = "normal",
  alt = "",
}: LogoProps) {
  const logoMap = {
    normal: logo,
    round: logoRound,
  };

  return (
    <img
      className={`logo ${className} ${size}`.replace(/\s+/g, " ").trim()}
      src={logoMap[type]}
      alt={alt}
      style={style}
    />
  );
}
