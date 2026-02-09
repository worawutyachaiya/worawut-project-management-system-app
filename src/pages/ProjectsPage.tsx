import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Grid,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types";
import { projectService } from "@/services/projectService";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import EditProjectDialog from "@/components/projects/EditProjectDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useAuthStore } from "@/stores/authStore";

const statusColors: Record<
  string,
  "default" | "primary" | "warning" | "success" | "error"
> = {
  DRAFT: "default",
  ACTIVE: "primary",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

const priorityColors: Record<
  string,
  "default" | "primary" | "warning" | "error"
> = {
  LOW: "default",
  MEDIUM: "primary",
  HIGH: "warning",
  CRITICAL: "error",
};

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const canManage = hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR");

  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch projects
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.search({}),
  });

  const projects = data?.ResultOnDb || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: (response) => {
      if (response.Status) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setSnackbar({
          open: true,
          message: "Project deleted successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.Message || "Failed to delete project",
          severity: "error",
        });
      }
      setDeleteOpen(false);
      setSelectedProject(null);
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Failed to delete project",
        severity: "error",
      });
      setDeleteOpen(false);
    },
  });

  const filteredProjects = projects.filter(
    (p) =>
      p.NAME?.toLowerCase().includes(search.toLowerCase()) ||
      p.CODE?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
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
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.ID);
    }
  };

  return (
    <Box>
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
            Projects
          </Typography>
          <Typography color="text.secondary">
            Manage your team's projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          New Project
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load projects. Please try again.
        </Alert>
      )}

      {/* Project Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.ID}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <FolderIcon />
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, project)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                  {project.NAME}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.CODE}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={project.STATUS}
                    size="small"
                    color={statusColors[project.STATUS] || "default"}
                  />
                  <Chip
                    label={project.PRIORITY}
                    size="small"
                    color={priorityColors[project.PRIORITY] || "default"}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {projectService.getProgress(project)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={projectService.getProgress(project)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        background:
                          "linear-gradient(90deg, #991B1B 0%, #DC2626 100%)",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AvatarGroup
                    max={4}
                    sx={{
                      "& .MuiAvatar-root": {
                        width: 28,
                        height: 28,
                        fontSize: 12,
                      },
                    }}
                  >
                    <Avatar>T</Avatar>
                  </AvatarGroup>
                  {project.END_DATE && (
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(project.END_DATE).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {!isLoading && filteredProjects.length === 0 && (
          <Grid size={12}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <FolderIcon
                sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No projects found
              </Typography>
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Create your first project
                </Button>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Project created successfully",
            severity: "success",
          });
        }}
      />

      <EditProjectDialog
        open={editOpen}
        project={selectedProject}
        onClose={() => {
          setEditOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Project updated successfully",
            severity: "success",
          });
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        itemName={selectedProject?.NAME}
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedProject(null);
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
