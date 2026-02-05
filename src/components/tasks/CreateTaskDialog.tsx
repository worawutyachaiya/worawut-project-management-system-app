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
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";

interface TaskFormData {
  projectId: number | "";
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  taskType: "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT";
  estimatedHours: number | "";
  dueDate: string;
  assigneeId: number | "";
}

interface CreateTaskDialogProps {
  open: boolean;
  projectId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTaskDialog({
  open,
  projectId,
  onClose,
  onSuccess,
}: CreateTaskDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<TaskFormData>({
    projectId: projectId || "",
    title: "",
    description: "",
    priority: "MEDIUM",
    taskType: "TASK",
    estimatedHours: "",
    dueDate: "",
    assigneeId: "",
  });

  useEffect(() => {
    if (projectId) {
      setFormData((prev) => ({ ...prev, projectId }));
    }
  }, [projectId]);

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: () => projectService.search({ limit: 100 }),
    enabled: open && !projectId,
  });

  const { data: users } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => userService.search({ limit: 100 }),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      taskService.create({
        PROJECT_ID: data.projectId as number,
        TITLE: data.title,
        DESCRIPTION: data.description || undefined,
        PRIORITY: data.priority,
        TASK_TYPE: data.taskType,
        ESTIMATED_HOURS: data.estimatedHours || undefined,
        DUE_DATE: data.dueDate || undefined,
      }),
    onSuccess: async (response) => {
      if (response.Status) {
        // Assign user if selected
        if (formData.assigneeId && response.ResultOnDb?.insertId) {
          await taskService.addAssignee(
            response.ResultOnDb.insertId,
            formData.assigneeId as number,
          );
        }
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onSuccess?.();
        handleClose();
      } else {
        setError(response.Message || "Failed to create task");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create task");
    },
  });

  const handleClose = () => {
    setFormData({
      projectId: projectId || "",
      title: "",
      description: "",
      priority: "MEDIUM",
      taskType: "TASK",
      estimatedHours: "",
      dueDate: "",
      assigneeId: "",
    });
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.projectId) {
      setError("Project is required");
      return;
    }
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {!projectId && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={formData.projectId}
                    onChange={(e) => handleChange("projectId", e.target.value)}
                    label="Project"
                  >
                    {projects?.ResultOnDb?.map((project) => (
                      <MenuItem key={project.ID} value={project.ID}>
                        [{project.CODE}] {project.NAME}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={formData.taskType}
                  onChange={(e) => handleChange("taskType", e.target.value)}
                  label="Task Type"
                >
                  <MenuItem value="TASK">Task</MenuItem>
                  <MenuItem value="BUG">Bug</MenuItem>
                  <MenuItem value="FEATURE">Feature</MenuItem>
                  <MenuItem value="IMPROVEMENT">Improvement</MenuItem>
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
                label="Estimated Hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) =>
                  handleChange(
                    "estimatedHours",
                    e.target.value ? parseFloat(e.target.value) : "",
                  )
                }
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assigneeId}
                  onChange={(e) => handleChange("assigneeId", e.target.value)}
                  label="Assign To"
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {users?.ResultOnDb?.map((user) => (
                    <MenuItem key={user.ID} value={user.ID}>
                      {user.FIRST_NAME} {user.LAST_NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            {createMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
