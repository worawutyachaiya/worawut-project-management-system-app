import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Button,
} from "@mui/material";
import { Add as AddIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import type { Task, TaskStatus } from "@/types";
import dayjs from "dayjs";

const statusConfig: Record<
  TaskStatus,
  {
    color: "default" | "primary" | "warning" | "success" | "error" | "info";
    label: string;
  }
> = {
  DRAFT: { color: "default", label: "Draft" },
  IN_PROGRESS: { color: "primary", label: "In Progress" },
  PENDING_REVIEW: { color: "warning", label: "Pending Review" },
  REVISION_REQUESTED: { color: "info", label: "Revision Requested" },
  APPROVED: { color: "success", label: "Approved" },
  REJECTED: { color: "error", label: "Rejected" },
  COMPLETED: { color: "success", label: "Completed" },
};

const priorityConfig: Record<
  string,
  { color: "default" | "primary" | "warning" | "error"; label: string }
> = {
  LOW: { color: "default", label: "Low" },
  MEDIUM: { color: "primary", label: "Medium" },
  HIGH: { color: "warning", label: "High" },
  CRITICAL: { color: "error", label: "Critical" },
};

interface TasksTableProps {
  tasks: Task[];
  isLoading: boolean;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
  onCreateOpen: () => void;
}

export default function TasksTable({
  tasks,
  isLoading,
  onMenuOpen,
  onCreateOpen,
}: TasksTableProps) {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Assignees</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    {isLoading ? "Loading..." : "No tasks found"}
                  </Typography>
                  {!isLoading && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={onCreateOpen}
                      sx={{ mt: 2 }}
                    >
                      Create your first task
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.ID} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      color="primary"
                    >
                      {task.CODE}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500} noWrap sx={{ maxWidth: 300 }}>
                      {task.TITLE}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig[task.STATUS]?.label || task.STATUS}
                      size="small"
                      color={statusConfig[task.STATUS]?.color || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        priorityConfig[task.PRIORITY]?.label || task.PRIORITY
                      }
                      size="small"
                      color={priorityConfig[task.PRIORITY]?.color || "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{task.TASK_TYPE}</Typography>
                  </TableCell>
                  <TableCell>
                    {task.DUE_DATE ? (
                      <Typography variant="body2">
                        {dayjs(task.DUE_DATE).format("MMM D, YYYY")}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {task.assignees?.slice(0, 3).map((a) => (
                        <Avatar
                          key={a.ID}
                          sx={{ width: 28, height: 28, fontSize: 12 }}
                        >
                          {a.user?.FIRST_NAME?.[0] || "U"}
                        </Avatar>
                      ))}
                      {(task.assignees?.length || 0) > 3 && (
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 10,
                            bgcolor: "grey.300",
                          }}
                        >
                          +{(task.assignees?.length || 0) - 3}
                        </Avatar>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => onMenuOpen(e, task)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
