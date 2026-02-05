import { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Divider,
  Dialog,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  History as HistoryIcon,
  AttachFile as FileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import type { TaskCompletionLog, Comment, TaskFile } from "@/types";
import dayjs from "dayjs";

interface TaskExecutionHistoryProps {
  taskId: number;
}

export default function TaskExecutionHistory({
  taskId,
}: TaskExecutionHistoryProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["task-history", taskId],
    queryFn: async () => {
      const res = await taskService.getCompletionHistory(taskId);
      return (res.ResultOnDb || []) as TaskCompletionLog[];
    },
  });

  if (isLoading) {
    return <Typography sx={{ p: 2 }}>Loading history...</Typography>;
  }

  if (logs.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
        <Typography>No previous completion history found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {logs.map((log, index) => (
        <Accordion key={log.ID} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Cycle {logs.length - index}
              </Typography>
              <Chip
                label={dayjs(log.COMPLETED_DATE).format("MMM D, YYYY")}
                size="small"
                color="success"
                variant="outlined"
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <TimeIcon fontSize="small" />
                <Typography variant="body2">
                  {log.DURATION_HOURS} hrs
                </Typography>
              </Box>
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mr: 2,
                }}
              >
                <Typography variant="caption">Completed by</Typography>
                <Avatar
                  src={log.COMPLETED_BY_AVATAR}
                  sx={{ width: 24, height: 24, fontSize: 12 }}
                >
                  {log.COMPLETED_BY_NAME?.[0]}
                </Avatar>
                <Typography variant="body2">{log.COMPLETED_BY_NAME}</Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Snapshot Content */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Comments ({log.SNAPSHOT_DATA.comments.length})
            </Typography>
            <List dense>
              {log.SNAPSHOT_DATA.comments.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pl: 2 }}
                >
                  No comments in this cycle.
                </Typography>
              ) : (
                log.SNAPSHOT_DATA.comments.map((comment: Comment) => (
                  <ListItem key={comment.ID} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        src={comment.USER_AVATAR}
                        alt={comment.USER_NAME}
                        sx={{ width: 32, height: 32 }}
                      >
                        {comment.USER_NAME?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle2">
                            {comment.USER_NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(comment.CREATE_DATE).format("MMM D, HH:mm")}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.CONTENT}
                    />
                  </ListItem>
                ))
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Attachments ({log.SNAPSHOT_DATA.files.length})
            </Typography>
            {log.SNAPSHOT_DATA.files.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                No files attached.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                {log.SNAPSHOT_DATA.files.map((file: TaskFile) => {
                  const isImage =
                    file.FILE_TYPE?.toLowerCase().startsWith("image/") ||
                    file.MIME_TYPE?.toLowerCase().startsWith("image/") ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.FILE_NAME || "");

                  return (
                    <Box
                      key={file.ID}
                      sx={{
                        width: 120,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      {isImage ? (
                        <Box
                          component="img"
                          src={file.STORAGE_URL}
                          alt={file.FILE_NAME}
                          sx={{
                            width: "100%",
                            height: 80,
                            objectFit: "cover",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                          }}
                          onClick={() => setPreviewImage(file.STORAGE_URL)}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "grey.100",
                          }}
                        >
                          <FileIcon color="action" />
                        </Box>
                      )}
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ display: "block", p: 0.5, textAlign: "center" }}
                      >
                        {/* {file.FILE_NAME} */}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: { bgcolor: "transparent", boxShadow: "none" },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={previewImage || ""}
            sx={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
