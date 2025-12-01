// Dashboard.styles.js
import styled from "styled-components";

export const StyledNavbar = styled.div`
  width: 99vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 2rem;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: white;
  box-sizing: border-box;
`;

export const StyledContainer = styled.div`
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
`;

export const FileListContainer = styled.div`
  width: 80%;
  max-width: 800px;
  margin-top: 2rem;
`;
