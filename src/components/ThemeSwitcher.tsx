"use client";

import { Button, Dropdown, Tooltip } from "antd";
import { SunOutlined, MoonOutlined, LaptopOutlined } from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <SunOutlined />;
      case "dark":
        return <MoonOutlined />;
      case "system":
        return <LaptopOutlined />;
      default:
        return <LaptopOutlined />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const items = [
    {
      key: "light",
      label: "Light",
      icon: <SunOutlined />,
      onClick: () => setTheme("light"),
    },
    {
      key: "dark",
      label: "Dark",
      icon: <MoonOutlined />,
      onClick: () => setTheme("dark"),
    },
    {
      key: "system",
      label: "System",
      icon: <LaptopOutlined />,
      onClick: () => setTheme("system"),
    },
  ];

  return (
    <Tooltip title={`Theme: ${getThemeLabel()}`}>
      <Dropdown
        menu={{ items }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Button
          type="text"
          size="small"
          icon={getThemeIcon()}
          style={{ color: "var(--nova-muted)" }}
        />
      </Dropdown>
    </Tooltip>
  );
}
