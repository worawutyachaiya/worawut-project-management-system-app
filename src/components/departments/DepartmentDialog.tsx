import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { departmentService } from "@/services/departmentService";
import type { Department } from "@/types";

interface DepartmentDialogProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepartmentDialog({
  open,
  department,
  onClose,
  onSuccess,
}: DepartmentDialogProps) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.CODE || "",
        name: department.NAME || "",
        description: department.DESCRIPTION || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
      });
    }
    setError("");
  }, [department, open]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        CODE: data.code,
        NAME: data.name,
        DESCRIPTION: data.description,
      };
      if (department) {
        return departmentService.update(department.ID, payload);
      } else {
        return departmentService.create(payload);
      }
    },
    onSuccess: (res) => {
      if (res.Status) {
        onSuccess();
        onClose();
      } else {
        setError(res.Message || "Operation failed");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Operation failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {department ? "Edit Department" : "Create Department"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Department Code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              required
              disabled={!!department} // Often codes are immutable, but allowing edit if backend supports it. Assuming immutable or edit ok.
              helperText={department ? "Department Code" : "Unique code"}
            />

            <TextField
              fullWidth
              label="Department Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? <CircularProgress size={16} /> : null
            }
          >
            {department ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
