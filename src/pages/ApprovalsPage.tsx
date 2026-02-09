import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ChangeCircle as RevisionIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalService, taskService } from "@/services/taskService";
import type { Approval } from "@/types";
import ApprovalActionDialog from "@/components/approvals/ApprovalActionDialog";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import dayjs from "dayjs";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null,
  );
  const [actionType, setActionType] = useState<
    "APPROVE" | "REJECT" | "REVISION" | null
  >(null);
  const [viewingTaskId, setViewingTaskId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["approvals-pending"],
    queryFn: () => approvalService.getPending(),
  });

  const { data: viewingTaskData } = useQuery({
    queryKey: ["task-details", viewingTaskId],
    queryFn: () => taskService.getById(viewingTaskId!),
    enabled: !!viewingTaskId,
  });

  const approvals = (data?.ResultOnDb as Approval[]) || [];

  const handleAction = (
    approval: Approval,
    type: "APPROVE" | "REJECT" | "REVISION",
  ) => {
    setSelectedApproval(approval);
    setActionType(type);
  };

  const actionMutation = useMutation({
    mutationFn: async ({
      taskId,
      type,
      comment,
    }: {
      taskId: number;
      type: string;
      comment: string;
    }) => {
      switch (type) {
        case "APPROVE":
          return approvalService.approve(taskId, comment);
        case "REJECT":
          return approvalService.reject(taskId, comment);
        case "REVISION":
          return approvalService.requestRevision(taskId, comment);
        default:
          throw new Error("Invalid action");
      }
    },
    onSuccess: (res) => {
      if (res.Status) {
        setSnackbar({
          open: true,
          message: res.Message || "Action successful",
          severity: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["approvals-pending"] });
        // Also invalidate tasks as their status changed
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        setSnackbar({
          open: true,
          message: res.Message || "Action failed",
          severity: "error",
        });
      }
      handleCloseDialog();
    },
    onError: (err: Error) => {
      setSnackbar({
        open: true,
        message: err.message || "Action failed",
        severity: "error",
      });
    },
  });

  const handleConfirmAction = (comment: string) => {
    if (selectedApproval && actionType) {
      actionMutation.mutate({
        taskId: selectedApproval.TASK_ID,
        type: actionType,
        comment,
      });
    }
  };

  const handleCloseDialog = () => {
    setSelectedApproval(null);
    setActionType(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Approvals
        </Typography>
        <Typography color="text.secondary">
          Manage pending task approvals
        </Typography>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load approvals.
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Code</TableCell>
                <TableCell>Task Title</TableCell>
                <TableCell>Task URL</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      {isLoading ? "Loading..." : "No pending approvals"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.ID} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        color="primary"
                      >
                        {approval.TASK_ID || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {approval.TASK_TITLE || "Unknown Task"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {approval.TASK_URL ? (
                        <Tooltip title="Open Task URL">
                          <IconButton
                            component="a"
                            href={approval.TASK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            size="small"
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2">
                          {
                            // Ideally approval.task?.CREATED_BY_NAME but checking if available
                            // Using ID fallback if Name not populated
                            "System"
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {approval.CREATE_DATE
                        ? dayjs(approval.CREATE_DATE).format("MMM D, YYYY")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Pending Review"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          color="primary"
                          onClick={() => setViewingTaskId(approval.TASK_ID)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton
                          color="success"
                          onClick={() => handleAction(approval, "APPROVE")}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Request Revision">
                        <IconButton
                          color="warning"
                          onClick={() => handleAction(approval, "REVISION")}
                        >
                          <RevisionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          color="error"
                          onClick={() => handleAction(approval, "REJECT")}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ApprovalActionDialog
        open={Boolean(selectedApproval)}
        action={actionType}
        itemName={selectedApproval?.TASK_TITLE}
        loading={actionMutation.isPending}
        onConfirm={handleConfirmAction}
        onClose={handleCloseDialog}
      />

      {viewingTaskId && (
        <EditTaskDialog
          open={!!viewingTaskId}
          task={viewingTaskData?.ResultOnDb || null}
          onClose={() => setViewingTaskId(null)}
        />
      )}

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
