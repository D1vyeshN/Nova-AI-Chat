"use client";

import { Button, Tooltip } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { theme, setTheme, isLoaded } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <Button
        type="text"
        size="small"
        icon={<MoonOutlined />}
        style={{ color: "var(--nova-muted)" }}
      />
    );
  }

  return (
    <Tooltip title={`Theme: ${theme === "light" ? "Light" : "Dark"}`}>
      <Button
        type="text"
        size="small"
        icon={theme === "light" ? <SunOutlined /> : <MoonOutlined />}
        onClick={handleThemeToggle}
        style={{ color: "var(--nova-muted)" }}
      />
    </Tooltip>
  );
}
