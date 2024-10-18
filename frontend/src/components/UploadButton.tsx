import { Button, SxProps, Theme } from "@mui/material";
import { Fragment, useRef } from "react";

function UploadButton({
  onUpload,
  children,
  variant,
  sx,
  onClick,
  ...props
}: {
  onUpload: (file: File | null) => void;
  children: React.ReactNode;
  variant?: "text" | "outlined" | "contained";
  sx?: SxProps<Theme>;
  onClick?: () => void;
}) {
  const upLoadInputRef = useRef<HTMLInputElement>(null);

  return (
    <Fragment>
      <input
        ref={upLoadInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onUpload(e.target.files?.[0] || null)}
        onAbort={() => onUpload(null)}
        required
      />
      <Button
        variant={variant}
        onClick={() => {
            upLoadInputRef.current?.click();
            onClick?.();
        }}
        {...props}
        sx={sx}
      >
        Upload
      </Button>
    </Fragment>
  );
}

export default UploadButton;
