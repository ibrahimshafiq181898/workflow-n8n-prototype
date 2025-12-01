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
import ReactMarkdown from "react-markdown";
const { Dragger } = Upload;
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph as DocxParagraph,
  HeadingLevel,
  TextRun
} from "docx";

const { Title, Paragraph: AntParagraph } = Typography;

const ProcessedOutput = ({ proposals }) => {
  if (!proposals?.length) return null;

  const downloadWordFile = async () => {
    const docChildren = [];

    proposals.forEach((p, index) => {
      docChildren.push(
        new DocxParagraph({
          text: `Proposal ${index + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        })
      );

      const lines = p.text.split("\n");

      lines.forEach((line) => {
        // Handle # Headings
        if (line.startsWith("### ")) {
          docChildren.push(
            new DocxParagraph({
              text: line.replace("### ", ""),
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 120 }
            })
          );
        } else if (line.startsWith("## ")) {
          docChildren.push(
            new DocxParagraph({
              text: line.replace("## ", ""),
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 150 }
            })
          );
        } else if (line.startsWith("# ")) {
          docChildren.push(
            new DocxParagraph({
              text: line.replace("# ", ""),
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            })
          );
        }

        // Handle bullet lists
        else if (line.startsWith("- ") || line.startsWith("* ")) {
          docChildren.push(
            new DocxParagraph({
              text: line.substring(2),
              bullet: { level: 0 },
              spacing: { after: 80 }
            })
          );
        }

        // Blank line
        else if (line.trim() === "") {
          docChildren.push(new DocxParagraph(""));
        }

        // Normal paragraph
        else {
          docChildren.push(
            new DocxParagraph({
              children: [new TextRun(line)],
              spacing: { after: 120 }
            })
          );
        }
      });

      // Extra space after each proposal
      docChildren.push(new DocxParagraph(""));
    });

    const doc = new Document({
      sections: [{ children: docChildren }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "workflow_output.docx");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto"
      }}
    >
      <Card
        title="Workflow Output"
        extra={
          <Button type="primary" onClick={downloadWordFile}>
            Download Word File
          </Button>
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          padding: "20px"
        }}
      >
        {proposals.map((p, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <Title level={4}>Proposal {i + 1}</Title>

            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <Title level={1} {...props} />,
                h2: ({ node, ...props }) => <Title level={2} {...props} />,
                h3: ({ node, ...props }) => <Title level={3} {...props} />,
                p: ({ node, ...props }) => (
                  <AntParagraph
                    style={{ fontSize: "16px", lineHeight: "1.7" }}
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    style={{ marginBottom: 6, fontSize: "16px" }}
                    {...props}
                  />
                )
              }}
            >
              {p.text}
            </ReactMarkdown>
          </div>
        ))}
      </Card>
    </div>
  );
};

// =========================
// Main Component
// =========================
const Dashboard = () => {
  const [fileList, setFileList] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Processing failed");

      const data = await res.json();
      console.log("RAW RESPONSE FROM BACKEND:", data);

      // n8n sends an array → unwrap first item
      const output = Array.isArray(data) ? data[0] : data;

      // FIXED: read proposals from backend
      const cleaned = Array.isArray(output.proposals) ? output.proposals : [];

      console.log("FINAL CLEANED PROPOSALS:", cleaned);

      setProposals(cleaned);

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
