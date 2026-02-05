import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  CircularProgress,
  Dialog,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/commentService";
import { fileService } from "@/services/fileService";
import type { Comment, TaskFile } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface TaskCommentsProps {
  taskId: number;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const res = await commentService.search(taskId);
      return res.ResultOnDb || [];
    },
  });

  // Fetch files
  const { data: files = [] } = useQuery({
    queryKey: ["files", taskId],
    queryFn: async () => {
      const res = await fileService.search(taskId);
      return res.ResultOnDb || [];
    },
  });

  // Merge and sort
  const activities = [
    ...comments.map((c) => ({ ...c, type: "COMMENT" as const })),
    ...files.map((f) => ({ ...f, type: "FILE" as const })),
  ].sort((a, b) => dayjs(a.CREATE_DATE).diff(dayjs(b.CREATE_DATE)));

  // Mutations
  const createCommentMutation = useMutation({
    mutationFn: (text: string) => commentService.create(taskId, text),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (f: File) => fileService.upload(taskId, f),
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["files", taskId] });
    },
  });

  const handleSubmit = async () => {
    if (!content.trim() && !file) return;

    try {
      if (file) {
        await uploadFileMutation.mutateAsync(file);
      }
      if (content.trim()) {
        await createCommentMutation.mutateAsync(content);
      }
    } catch (error) {
      console.error("Failed to post activity", error);
    }
  };

  const isUploading =
    createCommentMutation.isPending || uploadFileMutation.isPending;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Activity & Comments
      </Typography>

      {/* Input Area */}
      <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={2}
            disabled={isUploading}
          />
        </Box>

        {file && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "grey.100",
              p: 1,
              borderRadius: 1,
            }}
          >
            <ImageIcon fontSize="small" />
            <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
              {file.name}
            </Typography>
            <IconButton size="small" onClick={() => setFile(null)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Button
            component="label"
            startIcon={<AttachFileIcon />}
            size="small"
            disabled={isUploading}
          >
            Attach Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </Button>
          <Button
            variant="contained"
            endIcon={
              isUploading ? <CircularProgress size={16} /> : <SendIcon />
            }
            onClick={handleSubmit}
            disabled={(!content.trim() && !file) || isUploading}
          >
            Post
          </Button>
        </Box>
      </Paper>

      {/* Activity List */}
      <List>
        {activities.map((item) => (
          <ListItem
            key={`${item.type}-${item.ID}`}
            alignItems="flex-start"
            sx={{ px: 0 }}
          >
            <ListItemAvatar>
              <Avatar
                src={item.type === "COMMENT" ? item.USER_AVATAR : undefined}
                alt={
                  item.type === "COMMENT"
                    ? item.USER_NAME
                    : item.UPLOADED_BY_NAME
                }
              >
                {
                  (item.type === "COMMENT"
                    ? item.USER_NAME
                    : item.UPLOADED_BY_NAME)?.[0]
                }
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="subtitle2"
                    component="span"
                    fontWeight="bold"
                  >
                    {item.type === "COMMENT"
                      ? item.USER_NAME
                      : item.UPLOADED_BY_NAME}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(item.CREATE_DATE).fromNow()}
                  </Typography>
                </Box>
              }
              secondary={
                <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                  {item.type === "COMMENT" && (
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {item.CONTENT}
                    </Typography>
                  )}
                  {item.type === "FILE" && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        uploaded an image:
                      </Typography>
                      <Box
                        component="img"
                        src={item.STORAGE_URL}
                        alt={item.FILE_NAME}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 300,
                          borderRadius: 1,
                          border: "1px solid #e0e0e0",
                          cursor: "pointer",
                          "&:hover": { opacity: 0.9 },
                        }}
                        onClick={() => setPreviewImage(item.STORAGE_URL)}
                      />
                    </Box>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
        {activities.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No activity yet. Be the first to comment!
          </Typography>
        )}
      </List>

      {/* Image Preview Dialog */}
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
