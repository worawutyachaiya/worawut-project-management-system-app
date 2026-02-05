import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Snackbar,
  Alert,
  Card,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/types";
import { taskService } from "@/services/taskService";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import TasksTable from "@/components/tasks/TasksTable";
import TasksBoard from "@/components/tasks/TasksBoard";
import { useAuthStore } from "@/stores/authStore";

const statusConfig: Record<string, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review",
  REVISION_REQUESTED: "Revision Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const canCreate = hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR");
  const canDelete = hasAnyRole("ADMIN", "MANAGER");

  const [viewMode, setViewMode] = useState<"TABLE" | "BOARD">("TABLE");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.search({}),
  });

  const tasks = data?.ResultOnDb || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.delete(id),
    onSuccess: (response) => {
      if (response.Status) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        setSnackbar({
          open: true,
          message: "Task deleted successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.Message || "Failed to delete task",
          severity: "error",
        });
      }
      setDeleteOpen(false);
      setSelectedTask(null);
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Failed to delete task",
        severity: "error",
      });
      setDeleteOpen(false);
    },
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.TITLE?.toLowerCase().includes(search.toLowerCase()) ||
      t.CODE?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.STATUS === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.ID);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Tasks
          </Typography>
          <Typography color="text.secondary">
            Manage and track your tasks
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newAlignment) => {
              if (newAlignment) setViewMode(newAlignment);
            }}
            size="small"
          >
            <ToggleButton value="TABLE">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="BOARD">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New Task
          </Button>
        </Box>
      </Box>

      {/* Filters (Shared) */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
            size="small"
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={
                <FilterIcon sx={{ mr: 1, color: "action.active" }} />
              }
            >
              <MenuItem value="ALL">All Status</MenuItem>
              {Object.entries(statusConfig).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load tasks. Please try again.
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        {viewMode === "TABLE" ? (
          <TasksTable
            tasks={filteredTasks}
            isLoading={isLoading}
            onMenuOpen={handleMenuOpen}
            onCreateOpen={() => setCreateOpen(true)}
          />
        ) : (
          <TasksBoard
            tasks={filteredTasks}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setEditOpen(true);
            }}
          />
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Task created successfully",
            severity: "success",
          });
        }}
      />

      <EditTaskDialog
        open={editOpen}
        task={selectedTask}
        onClose={() => {
          setEditOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Task updated successfully",
            severity: "success",
          });
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        itemName={selectedTask?.TITLE}
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
