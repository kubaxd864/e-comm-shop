"use client";
import { Switch } from "@mui/material";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode =
      savedTheme === "dark" ||
      (!savedTheme && document.documentElement.classList.contains("dark"));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  return <Switch checked={isDark} onChange={handleChange} />;
}
