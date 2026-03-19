"use client";

import { useState } from "react";
import { Modal, Input, Form, Typography, Tag, Space, Alert } from "antd";
import { KeyOutlined, ApiOutlined } from "@ant-design/icons";
import { ApiKeys } from "@/types";

const { Text, Link } = Typography;

interface Props {
  open: boolean;
  initialKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onCancel: () => void;
}

export function ApiKeyModal({ open, initialKeys, onSave, onCancel }: Props) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave({ groq: values.groq || "", elevenlabs: values.elevenlabs || "" });
    });
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Save Keys"
      cancelText="Cancel"
      title={
        <Space>
          <KeyOutlined style={{ color: "#00e5ff" }} />
          <span style={{ color: "#e8eaf0" }}>Configure API Keys</span>
        </Space>
      }
      styles={{
        content: { background: "#0e1117", border: "1px solid #1e2530" },
        header: { background: "#0e1117", borderBottom: "1px solid #1e2530" },
        footer: { background: "#0e1117", borderTop: "1px solid #1e2530" },
        mask: { backdropFilter: "blur(4px)" },
      }}
    >
      <div className="py-4 space-y-4">
        <Alert
          message="Keys are stored in your browser only — never sent to any server except the respective APIs."
          type="info"
          showIcon
          style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)" }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ groq: initialKeys.groq, elevenlabs: initialKeys.elevenlabs }}
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
              placeholder="sk_... (leave empty to use browser voice)"
              style={{ background: "#141820", borderColor: "#1e2530", color: "#e8eaf0" }}
            />
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
