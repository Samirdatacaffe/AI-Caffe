export interface NavItemType {
  label: string;
  hasDropdown: boolean;
}

export interface FolderItemType {
  id: string;
  name: string;
}

export interface ProgressStepType {
  step: number;
  label: string;
}

export interface ContextItemType {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export interface IconProps {
  size?: number;
  color?: string;
}
