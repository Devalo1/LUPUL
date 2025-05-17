import React from "react";
import { Grid as MuiGrid, GridProps as MuiGridProps } from "@mui/material";

interface CustomGridProps extends MuiGridProps {
  xs?: number;
  md?: number;
  container?: boolean;
  item?: boolean;
  sx?: Record<string, unknown>;
}

interface GridProps {
  children: React.ReactNode;
  spacing?: number;
  direction?: "row" | "column";
  justify?: "start" | "center" | "end" | "space-between" | "space-around";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  [key: string]: unknown;
}

export const GridItem: React.FC<CustomGridProps> = (props) => {
  return <MuiGrid component="div" item {...props} />;
};

export const GridContainer: React.FC<CustomGridProps> = (props) => {
  return <MuiGrid component="div" container {...props} />;
};

export const GridContainerItem: React.FC<CustomGridProps> = (props) => {
  return <MuiGrid component="div" container item {...props} />;
};

export const Grid: React.FC<GridProps> = (props) => {
  return <MuiGrid {...props} />;
};
