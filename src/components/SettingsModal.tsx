"use client";

import { useState } from "react";
import { Modal, Input, Form, Typography, Tag, Space, Alert, Select, Spin, Button, message } from "antd";
import { KeyOutlined, ApiOutlined, SoundOutlined, SettingOutlined } from "@ant-design/icons";
import { ApiKeys, Voice } from "@/types";

const { Text, Link } = Typography;
const { Option } = Select;

interface Props {
  open: boolean;
  initialKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onCancel: () => void;
}

export function SettingsModal({ open, initialKeys, onSave, onCancel }: Props) {
  const [form] = Form.useForm();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const selectedVoice = voices.find(v => v.name === values.selectedVoice);
      onSave({ 
        groq: values.groq || "", 
        elevenlabs: values.elevenlabs || "",
        selectedVoice: selectedVoice
      });
      message.success("Settings saved successfully!");
    });
  };

  const fetchVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await fetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'en-US' })
      });
      const data = await response.json();
      if (data.voices) {
        setVoices(data.voices);
        message.success("English voices loaded!");
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      message.error("Failed to load voices");
    } finally {
      setLoadingVoices(false);
    }
  };

  const fetchAllVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await fetch('/api/voices/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.voices) {
        setVoices(data.voices);
        message.success("All voices loaded!");
      }
    } catch (error) {
      console.error('Failed to fetch all voices:', error);
      message.error("Failed to load voices");
    } finally {
      setLoadingVoices(false);
    }
  };

  // Load voices when modal opens
  const handleAfterChange = (visible: boolean) => {
    if (visible && voices.length === 0) {
      fetchVoices(); // Auto-load English voices when modal opens
    }
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Save Settings"
      cancelText="Cancel"
      afterOpenChange={handleAfterChange}
      title={
        <Space>
          <SettingOutlined style={{ color: "#00e5ff" }} />
          <span style={{ color: "#e8eaf0" }}>Settings</span>
        </Space>
      }
      styles={{
        content: { background: "#0e1117", border: "1px solid #1e2530" },
        header: { background: "#0e1117", borderBottom: "1px solid #1e2530" },
        footer: { background: "#0e1117", borderTop: "1px solid #1e2530" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      width={600}
    >
      <div className="py-4 space-y-4">
        <Alert
          message="Settings are stored in your browser locally and never sent to any server except the respective APIs."
          type="info"
          showIcon
          style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)" }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            groq: initialKeys.groq, 
            elevenlabs: initialKeys.elevenlabs,
            selectedVoice: initialKeys.selectedVoice?.name
          }}
        >
          <Form.Item
            name="groq"
            label={
              <Space>
                <Tag color="cyan" style={{ fontFamily: "monospace" }}>GROQ</Tag>
                <Text style={{ color: "#8a94a8", fontSize: 12 }}>Required — Chat + STT</Text>
              </Space>
            }
            rules={[{ required: true, message: "Groq API key is required" }]}
          >
            <Input.Password
              prefix={<ApiOutlined style={{ color: "#5a6478" }} />}
              placeholder="gsk_..."
              style={{ background: "#141820", borderColor: "#1e2530", color: "#e8eaf0" }}
            />
          </Form.Item>

          <Form.Item
            name="elevenlabs"
            label={
              <Space>
                <Tag color="purple" style={{ fontFamily: "monospace" }}>ELEVENLABS</Tag>
                <Text style={{ color: "#8a94a8", fontSize: 12 }}>Optional — Premium TTS voice</Text>
              </Space>
            }
          >
            <Input.Password
              prefix={<ApiOutlined style={{ color: "#5a6478" }} />}
              placeholder="sk_... (optional premium voice)"
              style={{ background: "#141820", borderColor: "#1e2530", color: "#e8eaf0" }}
            />
          </Form.Item>

          <Form.Item
            name="selectedVoice"
            label={
              <Space>
                <Tag color="green" style={{ fontFamily: "monospace" }}>TTS VOICE</Tag>
                <Text style={{ color: "#8a94a8", fontSize: 12 }}>Select voice for text-to-speech</Text>
              </Space>
            }
          >
            <Space.Compact style={{ width: '100%' }}>
              <Select
                placeholder="Select a voice"
                style={{ flex: 1, background: "#141820", borderColor: "#1e2530" }}
                notFoundContent={loadingVoices ? <Spin size="small" /> : "No voices available"}
                showSearch
                filterOption={(input, option) => 
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                }
              >
                {voices.map((voice) => (
                  <Option key={voice.name} value={voice.name}>
                    <Space>
                      <Text style={{ color: "#e8eaf0" }}>{voice.name}</Text>
                      <Tag color={voice.gender === 'Female' ? 'pink' : 'blue'}>
                        {voice.gender}
                      </Tag>
                      <Tag color="default">
                        {voice.language}
                      </Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
              <Button 
                icon={<SoundOutlined />}
                onClick={fetchVoices}
                loading={loadingVoices}
                title="Load English voices"
              >
                EN
              </Button>
              <Button 
                icon={<SoundOutlined />}
                onClick={fetchAllVoices}
                loading={loadingVoices}
                title="Load all voices"
              >
                ALL
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>

        <div className="space-y-1">
          <Text style={{ color: "#5a6478", fontSize: 11, fontFamily: "monospace", display: "block" }}>
            Get your free keys:
          </Text>
          <Space size="large">
            <Link href="https://console.groq.com/keys" target="_blank" style={{ fontSize: 12 }}>
              → console.groq.com/keys
            </Link>
            <Link href="https://elevenlabs.io" target="_blank" style={{ fontSize: 12 }}>
              → elevenlabs.io (optional)
            </Link>
          </Space>
        </div>
      </div>
    </Modal>
  );
}
