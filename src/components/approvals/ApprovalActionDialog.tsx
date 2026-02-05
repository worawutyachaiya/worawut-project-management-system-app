import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface ApprovalActionDialogProps {
  open: boolean;
  action: "APPROVE" | "REJECT" | "REVISION" | null;
  itemName?: string;
  loading: boolean;
  onConfirm: (comment: string) => void;
  onClose: () => void;
}

export default function ApprovalActionDialog({
  open,
  action,
  itemName,
  loading,
  onConfirm,
  onClose,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(comment);
  };

  const getConfig = () => {
    switch (action) {
      case "APPROVE":
        return {
          title: "Approve Task",
          color: "success" as const,
          text: "Approve",
          description: `Are you sure you want to approve "${itemName}"?`,
        };
      case "REJECT":
        return {
          title: "Reject Task",
          color: "error" as const,
          text: "Reject",
          description: `Are you sure you want to reject "${itemName}"?`,
          required: true,
        };
      case "REVISION":
        return {
          title: "Request Revision",
          color: "warning" as const,
          text: "Request Revision",
          description: `Request revision for "${itemName}"?`,
          required: true,
        };
      default:
        return {
          title: "",
          color: "primary" as const,
          text: "",
          description: "",
        };
    }
  };

  const config = getConfig();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{config.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{config.description}</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments"
            placeholder={
              config.required
                ? "Please provide a reason..."
                : "Optional comments..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={config.required}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={config.color}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {config.text}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
