import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { departmentService } from "@/services/departmentService";

interface ProjectFormData {
  code: string;
  name: string;
  description: string;
  departmentId: number | "";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string;
  endDate: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateProjectDialog({
  open,
  onClose,
  onSuccess,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ProjectFormData>({
    code: "",
    name: "",
    description: "",
    departmentId: "",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.search(),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      projectService.create({
        CODE: data.code,
        NAME: data.name,
        DESCRIPTION: data.description || undefined,
        DEPARTMENT_ID: data.departmentId as number,
        PRIORITY: data.priority,
        START_DATE: data.startDate || undefined,
        END_DATE: data.endDate || undefined,
      }),
    onSuccess: (response) => {
      if (response.Status) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        onSuccess?.();
        handleClose();
      } else {
        setError(response.Message || "Failed to create project");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create project");
    },
  });

  const handleClose = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      departmentId: "",
      priority: "MEDIUM",
      startDate: "",
      endDate: "",
    });
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.code.trim()) {
      setError("Project code is required");
      return;
    }
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }
    if (!formData.departmentId) {
      setError("Department is required");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (field: keyof ProjectFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Project Code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                required
                placeholder="PRJ-001"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => handleChange("departmentId", e.target.value)}
                  label="Department"
                >
                  {departments?.ResultOnDb?.map((dept) => (
                    <MenuItem key={dept.ID} value={dept.ID}>
                      {dept.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
            startIcon={
              createMutation.isPending ? <CircularProgress size={16} /> : null
            }
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
