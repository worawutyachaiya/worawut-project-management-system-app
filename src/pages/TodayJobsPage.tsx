import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  AvatarGroup,
  Tooltip,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { todayJobsService } from "@/services/todayJobsService";
import type { Task } from "@/types";

const priorityColors: Record<string, "error" | "warning" | "info" | "success"> =
  {
    CRITICAL: "error",
    HIGH: "warning",
    MEDIUM: "info",
    LOW: "success",
  };

const statusColors: Record<
  string,
  "default" | "primary" | "warning" | "info" | "success" | "error"
> = {
  DRAFT: "default",
  IN_PROGRESS: "primary",
  PENDING_REVIEW: "warning",
  REVISION_REQUESTED: "info",
  APPROVED: "success",
  REJECTED: "error",
  COMPLETED: "success",
};

export default function TodayJobsPage() {
  const [dateFilter, setDateFilter] = useState<string>("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subordinate-tasks", dateFilter],
    queryFn: () =>
      todayJobsService.getSubordinateTasks(dateFilter || undefined),
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const tasks = data?.ResultOnDb || [];
  const totalCount = data?.TotalCountOnDb || 0;

  const handleClearFilter = () => {
    setDateFilter("");
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load tasks. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Team Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View all pending tasks assigned to your subordinates
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            type="date"
            label="Filter by Due Date"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          {dateFilter && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilter}
            >
              Clear Filter
            </Button>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            {dateFilter
              ? `Showing tasks due on ${dayjs(dateFilter).format("MMM D, YYYY")}`
              : "Showing all pending tasks"}
          </Typography>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TaskIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Pending Tasks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <WarningIcon color="warning" fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {
                    tasks.filter(
                      (t: Task) =>
                        t.PRIORITY === "CRITICAL" || t.PRIORITY === "HIGH",
                    ).length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CalendarIcon color="error" fontSize="large" />
              <Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {
                    tasks.filter(
                      (t: Task & { DUE_DATE?: string }) =>
                        t.DUE_DATE &&
                        dayjs(t.DUE_DATE).isBefore(dayjs(), "day"),
                    ).length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <TaskIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No pending tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateFilter
              ? "No tasks due on this date"
              : "Your team has no pending tasks"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignees</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map(
                (
                  task: Task & {
                    PROJECT_NAME?: string;
                    ASSIGNEE_NAMES?: string;
                    DUE_DATE?: string;
                  },
                ) => {
                  const isOverdue =
                    task.DUE_DATE &&
                    dayjs(task.DUE_DATE).isBefore(dayjs(), "day");
                  return (
                    <TableRow
                      key={task.ID}
                      hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        borderLeft:
                          task.PRIORITY === "CRITICAL" || isOverdue
                            ? "4px solid"
                            : "none",
                        borderLeftColor: isOverdue
                          ? "error.main"
                          : "warning.main",
                        bgcolor: isOverdue
                          ? "rgba(239, 68, 68, 0.05)"
                          : "inherit",
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ fontFamily: "monospace", fontSize: 12 }}
                          >
                            {task.CODE}
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {task.TITLE}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {task.PROJECT_NAME || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {task.ASSIGNEE_NAMES ? (
                          <Tooltip title={task.ASSIGNEE_NAMES}>
                            <AvatarGroup
                              max={3}
                              sx={{ justifyContent: "flex-start" }}
                            >
                              {task.ASSIGNEE_NAMES.split(", ").map(
                                (name, idx) => (
                                  <Avatar
                                    key={idx}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      fontSize: 12,
                                      bgcolor: "primary.main",
                                    }}
                                  >
                                    {name.charAt(0)}
                                  </Avatar>
                                ),
                              )}
                            </AvatarGroup>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={isOverdue ? "error.main" : "text.primary"}
                          fontWeight={isOverdue ? 600 : 400}
                        >
                          {task.DUE_DATE
                            ? dayjs(task.DUE_DATE).format("MMM D, YYYY")
                            : "-"}
                        </Typography>
                        {isOverdue && (
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{ display: "block" }}
                          >
                            Overdue
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.PRIORITY}
                          size="small"
                          color={priorityColors[task.PRIORITY] || "default"}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.STATUS?.replace(/_/g, " ")}
                          size="small"
                          color={statusColors[task.STATUS] || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                },
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
