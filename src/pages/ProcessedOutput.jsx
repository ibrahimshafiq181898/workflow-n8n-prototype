import { Card, Button, Table, Typography } from "antd";

const { Title, Paragraph } = Typography;

const ProcessedOutput = ({ output, downloadUrl }) => {
  if (!output) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <Card
        title="Workflow Output (Dummy Example)"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
        }}
      >
        <Title level={4}>Summary</Title>
        <Paragraph>{output.summary}</Paragraph>

        {output.htmlPreview && (
          <>
            <Title level={4}>Preview</Title>
            <div
              dangerouslySetInnerHTML={{ __html: output.htmlPreview }}
              style={{
                background: "#fafafa",
                padding: "1rem",
                borderRadius: "8px"
              }}
            />
          </>
        )}

        {output.table && (
          <>
            <Title level={4} style={{ marginTop: "1.5rem" }}>
              Extracted Table
            </Title>
            <Table
              dataSource={output.table}
              rowKey="name"
              columns={Object.keys(output.table[0]).map(key => ({
                title: key.toUpperCase(),
                dataIndex: key,
                key
              }))}
              pagination={false}
              bordered
            />
          </>
        )}

        <Button
          type="primary"
          style={{ marginTop: "2rem" }}
          href={downloadUrl}
          download
        >
          Download Processed Word File
        </Button>
      </Card>
    </div>
  );
};

export default ProcessedOutput;
