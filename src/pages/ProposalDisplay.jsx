import React, { useState } from "react";
import { Card, Button, Collapse } from "antd";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";

const { Panel } = Collapse;

const ProposalsDisplay = ({ proposals }) => {
  const generateWord = () => {
    const doc = new Document();

    proposals.forEach((p, index) => {
      doc.addSection({
        children: [
          new Paragraph({ text: `Proposal ${index + 1}`, bold: true }),
          new Paragraph(p.text),
          new Paragraph({ text: "\n" }) // Add spacing
        ]
      });
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Proposals.docx");
    });
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={generateWord}
        style={{ marginBottom: "1rem" }}
      >
        Download Word File
      </Button>

      <Collapse accordion>
        {proposals.map((p, idx) => (
          <Panel header={`Proposal ${idx + 1}`} key={idx}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{p.text}</pre>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ProposalsDisplay;
