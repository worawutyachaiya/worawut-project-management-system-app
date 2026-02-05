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
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import TaskComments from "./TaskComments";
import TaskExecutionHistory from "./TaskExecutionHistory";
import ApprovalFeedback from "./ApprovalFeedback";
import type { Task } from "@/types";

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  taskType: string;
  estimatedHours: number | "";
  actualHours: number | "";
  dueDate: string;
}

interface EditTaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTaskDialog({
  open,
  task,
  onClose,
  onSuccess,
}: EditTaskDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "DRAFT",
    priority: "MEDIUM",
    taskType: "TASK",
    estimatedHours: "",
    actualHours: "",
    dueDate: "",
  });

  const [tab, setTab] = useState(0);

  const { data: fullTaskData } = useQuery({
    queryKey: ["task-detail", task?.ID],
    queryFn: () => taskService.getById(task!.ID),
    enabled: open && !!task?.ID,
  });

  const fullTask = fullTaskData?.ResultOnDb || task;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.TITLE || "",
        description: task.DESCRIPTION || "",
        status: task.STATUS || "DRAFT",
        priority: task.PRIORITY || "MEDIUM",
        taskType: task.TASK_TYPE || "TASK",
        estimatedHours: task.ESTIMATED_HOURS || "",
        actualHours: task.ACTUAL_HOURS || "",
        dueDate: task.DUE_DATE?.split("T")[0] || "",
      });
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      taskService.update(task!.ID, {
        TITLE: data.title,
        DESCRIPTION: data.description || undefined,
        STATUS: data.status as Task["STATUS"],
        PRIORITY: data.priority as Task["PRIORITY"],
        TASK_TYPE: data.taskType as Task["TASK_TYPE"],
        ESTIMATED_HOURS: data.estimatedHours || undefined,
        ACTUAL_HOURS: data.actualHours || undefined,
        DUE_DATE: data.dueDate || undefined,
      }),
    onSuccess: (response) => {
      if (response.Status) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onSuccess?.();
        onClose();
      } else {
        setError(response.Message || "Failed to update task");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update task");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              aria-label="task tabs"
            >
              <Tab label="General" />
              <Tab label="Activity" />
              <Tab label="History" />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={tab !== 0}>
            {tab === 0 && (
              <>
                {/* Show rejection/revision feedback */}
                <ApprovalFeedback
                  approvals={fullTask?.approvals}
                  taskStatus={fullTask?.STATUS}
                />
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="DRAFT">Draft</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="PENDING_REVIEW">
                          Pending Review
                        </MenuItem>
                        <MenuItem value="REVISION_REQUESTED">
                          Revision Requested
                        </MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        onChange={(e) =>
                          handleChange("priority", e.target.value)
                        }
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
                    <FormControl fullWidth>
                      <InputLabel>Task Type</InputLabel>
                      <Select
                        value={formData.taskType}
                        onChange={(e) =>
                          handleChange("taskType", e.target.value)
                        }
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
                    <TextField
                      fullWidth
                      label="Due Date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleChange("dueDate", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
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
                      label="Actual Hours"
                      type="number"
                      value={formData.actualHours}
                      onChange={(e) =>
                        handleChange(
                          "actualHours",
                          e.target.value ? parseFloat(e.target.value) : "",
                        )
                      }
                      inputProps={{ min: 0, step: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>

          <Box role="tabpanel" hidden={tab !== 1}>
            {tab === 1 && task && <TaskComments taskId={task.ID} />}
          </Box>

          <Box role="tabpanel" hidden={tab !== 2}>
            {tab === 2 && task && <TaskExecutionHistory taskId={task.ID} />}
          </Box>
        </DialogContent>
        {tab === 0 && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
              startIcon={
                updateMutation.isPending ? <CircularProgress size={16} /> : null
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
}
