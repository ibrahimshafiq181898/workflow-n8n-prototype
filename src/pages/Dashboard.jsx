import React, { useState } from "react";
import {
  StyledContainer,
  StyledNavbar,
  FileListContainer
} from "./Dashboard.styles.js";
import {
  InboxOutlined,
  FileExcelOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { message, Upload, Button, List, Card, Spin, Typography } from "antd";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

// 🔥 UPDATED COMPONENT: Now includes "Download Word File" button
const ProcessedOutput = ({ proposals }) =>
  proposals?.length ? (
    <Card
      title="Workflow Output"
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        marginTop: 24
      }}
    >
      {proposals.map((p, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <Title level={4}>Proposal {i + 1}</Title>

          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{p.text}</Paragraph>

          {/* Word file download button */}
          {p.word_file_url && (
            <Button
              type="primary"
              style={{ marginTop: 12 }}
              href={p.word_file_url}
              download
            >
              Download Word File
            </Button>
          )}
        </div>
      ))}
    </Card>
  ) : null;

const Dashboard = () => {
  const [fileList, setFileList] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Processing failed");

      const data = await res.json();

      // 🔥 Updated: Now reading proposals + file download URLs
      setProposals(data.proposals || data);

      message.success(`${file.name} processed successfully.`);
      onSuccess("ok");
    } catch (err) {
      console.error(err);
      message.error(`${file.name} processing failed.`);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StyledNavbar>
        <h2>Excel Dashboard</h2>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setFileList([]);
            setProposals([]);
            message.info("All files cleared.");
          }}
        >
          Clear All
        </Button>
      </StyledNavbar>

      <StyledContainer>
        <Dragger
          name="file"
          multiple
          accept=".xls,.xlsx,.pdf,.docx,.doc"
          customRequest={handleUpload}
          fileList={fileList}
          onChange={(info) => setFileList([...info.fileList])}
          style={{
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <InboxOutlined style={{ fontSize: 32, color: "#1890ff" }} />
          <p>Click or drag files to upload</p>
          <p>Only .xls, .xlsx, .pdf, .docx files.</p>
        </Dragger>

        {fileList.length > 0 && (
          <FileListContainer>
            <h3>Uploaded Files</h3>
            <List
              bordered
              dataSource={fileList}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <span>{(file.size / 1024).toFixed(2)} KB</span>,
                    <span>{file.status}</span>
                  ]}
                >
                  <FileExcelOutlined
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  {file.name}
                </List.Item>
              )}
            />
          </FileListContainer>
        )}

        {loading ? (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <Spin size="large" tip="Processing workflow..." />
          </div>
        ) : (
          <ProcessedOutput proposals={proposals} />
        )}
      </StyledContainer>
    </>
  );
};

export default Dashboard;
