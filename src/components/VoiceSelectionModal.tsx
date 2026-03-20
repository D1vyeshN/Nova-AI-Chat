"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Select,
  Space,
  Typography,
  Tag,
  Spin,
  Button,
  message,
} from "antd";
import { SoundOutlined, SettingOutlined } from "@ant-design/icons";
import { Voice } from "@/types";
import { allVoices } from "@/utils/voices";

const { Text } = Typography;
const { Option } = Select;

interface FilterOptions {
  country: string;
  language: string;
  gender: string;
}

interface Props {
  open: boolean;
  initialVoice: Voice | undefined;
  onSave: (voice: Voice) => void;
  onCancel: () => void;
}

export function VoiceSelectionModal({
  open,
  initialVoice,
  onSave,
  onCancel,
}: Props) {
  // const [allVoices, setAllVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    country: "",
    language: "",
    gender: "",
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(
    initialVoice?.name || "",
  );


  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const countries = [
      ...new Set(
        allVoices.map((voice) => {
          const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
            type: "region",
          });
          const regionNamesInLocal = new Intl.DisplayNames(
            [voice.language.split("-")[0]],
            { type: "region" },
          );
          const parts = voice.language.split("-");
          const possibleRegion = parts[parts.length - 1];
          const countryCode = /^[A-Z]{2}$/.test(possibleRegion)
            ? possibleRegion.toUpperCase()
            : "US";

          return {label: regionNamesInEnglish.of(countryCode), value: countryCode};
        }),
      ),
    ].filter(Boolean);
    const languages = [
      ...new Set(allVoices.map((voice) => {
          const languageNamesInEnglish = new Intl.DisplayNames(["en"], {
            type: "language",
          });
          const languageNamesInLocal = new Intl.DisplayNames(
            [voice.language.split("-")[0]],
            { type: "language" },
          );
          const parts = voice.language.split("-");
          const possibleRegion = parts[parts.length - 1];
          const countryCode = /^[A-Z]{2}$/.test(possibleRegion)
            ? possibleRegion.toUpperCase()
            : "US";
            

          return {label: languageNamesInEnglish.of(voice.language), value: voice.language};
        })),
    ].filter(Boolean);
    const genders = [...new Set(allVoices.map((voice) => voice.gender))].filter(
      Boolean,
    );

    return {
      countries: countries.sort((a, b) => (a.label || '').localeCompare(b.label || '')),
      languages: languages.sort((a, b) => (a.label || '').localeCompare(b.label || '')),
      genders: genders.sort(),
    };
  }, [allVoices]);

  // Filter voices based on selected filters
  const filteredVoices = useMemo(() => {
    return allVoices.filter((voice) => {
      const countryMatch =
        !filters.country || voice.language.startsWith(filters.country);
      const languageMatch =
        !filters.language || voice.language === filters.language;
      const genderMatch = !filters.gender || voice.gender === filters.gender;

      return countryMatch && languageMatch && genderMatch;
    });
  }, [allVoices, filters]);

  // const fetchAllVoices = async () => {
  //   setLoadingVoices(true);
  //   try {
  //     const response = await fetch('/api/voices/all', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     const data = await response.json();
  //     if (data.voices) {
  //       setAllVoices(data.voices);
  //       message.success("All voices loaded!");
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch all voices:', error);
  //     message.error("Failed to load voices");
  //   } finally {
  //     setLoadingVoices(false);
  //   }
  // };

  const handleOk = () => {
    if (!selectedVoice) {
      message.warning("Please select a voice");
      return;
    }

    const voice = allVoices.find((v) => v.name === selectedVoice);
    if (voice) {
      onSave(voice as Voice);
      message.success("Voice selected successfully!");
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ country: "", language: "", gender: "" });
  };

  // Load voices when modal opens
  // useEffect(() => {
  //   if (open && allVoices.length === 0) {
  //     fetchAllVoices();
  //   }
  // }, [open, allVoices.length]);

  // Reset selected voice when initialVoice changes
  useEffect(() => {
    setSelectedVoice(initialVoice?.name || "");
  }, [initialVoice]);

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Select Voice"
      cancelText="Cancel"
      title={
        <Space>
          <SettingOutlined style={{ color: "#00e5ff" }} />
          <span style={{ color: "#e8eaf0" }}>Voice Selection</span>
        </Space>
      }
      styles={{
        content: { background: "#0e1117", border: "1px solid #1e2530" },
        header: { background: "#0e1117", borderBottom: "1px solid #1e2530" },
        footer: { background: "#0e1117", borderTop: "1px solid #1e2530" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      width={700}
    >
      <div className="py-4 space-y-4">
        {/* Filters Section */}
        <div className="space-y-3">
          <Text style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>
            Filter Voices
          </Text>

          <Space.Compact style={{ width: "100%" }} direction="vertical">
            <Space style={{ width: "100%" }}>
              <Select
                placeholder="Select Country"
                style={{
                  flex: 1,
                  background: "#141820",
                  borderColor: "#1e2530",
                }}
                value={filters.country || undefined}
                onChange={(value) => handleFilterChange("country", value)}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) || false
                }
              >
                {filterOptions.countries.map((country) => (
                  <Option key={country.value} value={country.value}>
                    {country.label}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Select Language"
                style={{
                  flex: 1,
                  background: "#141820",
                  borderColor: "#1e2530",
                }}
                value={filters.language || undefined}
                onChange={(value) => handleFilterChange("language", value)}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) || false
                }
              >
                {filterOptions.languages.map((language) => (
                  <Option key={language.value} value={language.value}>
                    {language.label}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Select Gender"
                style={{
                  flex: 1,
                  background: "#141820",
                  borderColor: "#1e2530",
                }}
                value={filters.gender || undefined}
                onChange={(value) => handleFilterChange("gender", value)}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) || false
                }
              >
                {filterOptions.genders.map((gender) => (
                  <Option key={gender} value={gender}>
                    {gender}
                  </Option>
                ))}
              </Select>
            </Space>

            <Button
              onClick={clearFilters}
              size="small"
              style={{ width: "100%" }}
            >
              Clear Filters
            </Button>
          </Space.Compact>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Text style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>
              Available Voices ({filteredVoices.length})
            </Text>
            
          </Space>

          <Select
            placeholder="Select a voice"
            style={{
              width: "100%",
              background: "#141820",
              borderColor: "#1e2530",
            }}
            value={selectedVoice || undefined}
            onChange={setSelectedVoice}
            notFoundContent={
              loadingVoices ? <Spin size="small" /> : "No voices available"
            }
            showSearch
            filterOption={(input, option) =>
              option?.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase()) || false
            }
          >
            {filteredVoices.map((voice) => (
              <Option key={voice.name} value={voice.name}>
                <Space>
                  <Text style={{ color: "#e8eaf0" }}>{voice.name}</Text>
                  <Tag color={voice.gender === "Female" ? "pink" : "blue"}>
                    {voice.gender}
                  </Tag>
                  <Tag color="default">{voice.language}</Tag>
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        {/* Selected Voice Preview */}
        {selectedVoice && (
          <div className="space-y-2">
            <Text style={{ color: "#e8eaf0", fontSize: 14, fontWeight: 600 }}>
              Selected Voice
            </Text>
            <div
              className="p-3 rounded-lg"
              style={{
                background: "rgba(0,229,255,0.05)",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
            >
              {(() => {
                const voice = allVoices.find((v) => v.name === selectedVoice);
                return voice ? (
                  <Space>
                    <Text style={{ color: "#e8eaf0", fontWeight: 500 }}>
                      {voice.name}
                    </Text>
                    <Tag color={voice.gender === "Female" ? "pink" : "blue"}>
                      {voice.gender}
                    </Tag>
                    <Tag color="default">{voice.language}</Tag>
                  </Space>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
