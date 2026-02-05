import { Box, Alert, AlertTitle, Typography, Chip } from "@mui/material";
import {
  Warning as WarningIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import type { TaskApproval } from "@/types";

interface ApprovalFeedbackProps {
  approvals?: TaskApproval[];
  taskStatus?: string;
}

export default function ApprovalFeedback({
  approvals,
  taskStatus,
}: ApprovalFeedbackProps) {
  if (!["REJECTED", "REVISION_REQUESTED"].includes(taskStatus || "")) {
    return null;
  }

  // Find the latest approval with comments (rejection/revision reason)
  const latestFeedback = approvals
    ?.filter(
      (a) =>
        (a.STATUS === "REJECTED" || a.STATUS === "REVISION_REQUESTED") &&
        a.COMMENTS,
    )
    .sort((a, b) => {
      const dateA = a.DECISION_DATE ? new Date(a.DECISION_DATE).getTime() : 0;
      const dateB = b.DECISION_DATE ? new Date(b.DECISION_DATE).getTime() : 0;
      return dateB - dateA;
    })[0];

  if (!latestFeedback?.COMMENTS) {
    return null;
  }

  const isRejected = latestFeedback.STATUS === "REJECTED";

  return (
    <Alert
      severity={isRejected ? "error" : "warning"}
      icon={isRejected ? <RejectIcon /> : <WarningIcon />}
      sx={{
        mb: 3,
        borderRadius: 2,
        "& .MuiAlert-message": { width: "100%" },
      }}
    >
      <AlertTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isRejected ? "Task Rejected" : "Revision Requested"}
        <Chip
          label={latestFeedback.STATUS.replace(/_/g, " ")}
          size="small"
          color={isRejected ? "error" : "warning"}
          sx={{ ml: 1 }}
        />
      </AlertTitle>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            bgcolor: isRejected ? "error.50" : "warning.50",
            borderColor: isRejected ? "error.200" : "warning.200",
          }}
        >
          {latestFeedback.APPROVER_NAME || "Approver"} : "
          {latestFeedback.COMMENTS}"
        </Typography>
        {latestFeedback.DECISION_DATE && (
          <Typography variant="caption">
            {dayjs(latestFeedback.DECISION_DATE).format("MMM D, YYYY h:mm A")}
          </Typography>
        )}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            color: "text.secondary",
          }}
        >
          <Typography variant="caption">
            By: {latestFeedback.APPROVER_NAME || "Approver"}
          </Typography>
          {latestFeedback.DECISION_DATE && (
            <Typography variant="caption">
              {dayjs(latestFeedback.DECISION_DATE).format("MMM D, YYYY h:mm A")}
            </Typography>
          )}
        </Box> */}
      </Box>
    </Alert>
  );
}
