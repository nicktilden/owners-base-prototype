import React from "react";
import styled from "styled-components";

type RowVariant = "cards" | "table";

interface HubsRowProps {
  children: React.ReactNode;
  variant?: RowVariant;
  columnsTemplate?: string;
}

interface HubsContentLayoutComponent extends React.FC<{ children: React.ReactNode }> {
  Row: React.FC<HubsRowProps>;
}

const Layout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RowGrid = styled.div<{ $columns: number; $variant: RowVariant; $columnsTemplate?: string }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $columnsTemplate, $columns }) =>
    $columnsTemplate || `repeat(${$columns}, minmax(0, 1fr))`};
  gap: 16px;

  ${({ $variant }) =>
    $variant === "table" &&
    `
      > * {
        max-height: 800px;
        overflow: auto;
      }
    `}

@media (max-width: 1200px) {
    grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, minmax(0, 1fr));
    width: 100%;
    margin-left: 0px;
  }

  @media (max-width: 1280px) {
    grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HubsContentLayout = (({ children }) => {
  return <Layout>{children}</Layout>;
}) as HubsContentLayoutComponent;

HubsContentLayout.Row = function HubsContentRow({ children, variant = "cards", columnsTemplate }: HubsRowProps) {
  const childCount = React.Children.toArray(children).filter(Boolean).length;
  const columns = variant === "table" ? 1 : Math.max(1, Math.min(childCount || 1, 3));
  return (
    <RowGrid $columns={columns} $variant={variant} $columnsTemplate={columnsTemplate}>
      {children}
    </RowGrid>
  );
};

export default HubsContentLayout;
