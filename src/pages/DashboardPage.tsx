import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Folder as ProjectIcon,
  Assignment as TaskIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  loading,
}: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}15`,
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: () => projectService.search({ limit: 100 }),
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: () => taskService.search({ limit: 100 }),
  });

  const projects = projectsData?.ResultOnDb || [];
  const tasks = tasksData?.ResultOnDb || [];

  // Calculate stats
  const activeProjects = projects.filter(
    (p) => p.STATUS === "ACTIVE" || p.STATUS === "DRAFT",
  ).length;
  const totalTasks = tasks.length;
  const pendingApproval = tasks.filter(
    (t) => t.STATUS === "PENDING_REVIEW",
  ).length;
  const completedTasks = tasks.filter((t) => t.STATUS === "COMPLETED").length;

  const recentTasks = tasks.slice(0, 6);

  const topProjects = projects
    .filter((p) => p.STATUS === "ACTIVE" || p.STATUS === "DRAFT")
    .sort(
      (a, b) => projectService.getProgress(b) - projectService.getProgress(a),
    )
    .slice(0, 6);

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects,
      icon: <ProjectIcon />,
      color: "#2563eb",
      loading: projectsLoading,
    },
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: <TaskIcon />,
      color: "#ec4899",
      loading: tasksLoading,
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      icon: <PendingIcon />,
      color: "#f59e0b",
      loading: tasksLoading,
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: <ApprovedIcon />,
      color: "#10b981",
      loading: tasksLoading,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "primary";
      case "PENDING_REVIEW":
        return "warning";
      case "APPROVED":
      case "COMPLETED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName || "User"}! 👋
        </Typography>
        <Typography color="text.secondary">
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Tasks */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Tasks
              </Typography>
              {tasksLoading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={60}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ) : recentTasks.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No tasks found. Create your first task to get started!
                </Alert>
              ) : (
                <List disablePadding>
                  {recentTasks.map((task) => (
                    <ListItem
                      key={task.ID}
                      sx={{
                        px: 0,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.light" }}>
                          <TaskIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.TITLE}
                        secondary={task.CODE}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={task.PRIORITY}
                          size="small"
                          color={
                            getPriorityColor(task.PRIORITY) as
                              | "error"
                              | "warning"
                              | "primary"
                              | "default"
                          }
                          variant="outlined"
                        />
                        <Chip
                          label={task.STATUS?.replace("_", " ")}
                          size="small"
                          color={
                            getStatusColor(task.STATUS) as
                              | "primary"
                              | "warning"
                              | "success"
                              | "error"
                              | "default"
                          }
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Project Progress */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Project Progress
              </Typography>
              {projectsLoading ? (
                <Box sx={{ mt: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={50}
                      sx={{ mb: 2 }}
                    />
                  ))}
                </Box>
              ) : topProjects.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No active projects. Create a project to track progress!
                </Alert>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {topProjects.map((project) => (
                    <Box key={project.ID} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          noWrap
                          sx={{ maxWidth: "70%" }}
                        >
                          {project.NAME}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {projectService.getProgress(project)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={projectService.getProgress(project)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background:
                              "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
