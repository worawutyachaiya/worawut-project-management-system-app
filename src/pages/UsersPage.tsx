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
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import type { User } from "@/types";
import UserDialog from "@/components/users/UserDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", search],
    queryFn: () => userService.search({ search }),
  });

  const users = data?.ResultOnDb || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: (res) => {
      if (res.Status) {
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        setSnackbar({
          open: true,
          message: res.Message || "Failed to delete",
          severity: "error",
        });
      }
      setDeleteOpen(false);
      setSelectedUser(null);
    },
  });

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Users
          </Typography>
          <Typography color="text.secondary">Manage system users</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          New User
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Card>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.ID} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar src={user.AVATAR_URL}>
                          {user.FIRST_NAME[0]}
                        </Avatar>
                        <Typography fontWeight={500}>
                          {user.FIRST_NAME} {user.LAST_NAME}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.EMAIL}</TableCell>
                    <TableCell>{user.DEPARTMENT_NAME || "-"}</TableCell>
                    <TableCell>{user.ROLE_NAME || "User"}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.STATUS}
                        color={user.STATUS === "ACTIVE" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <UserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "User created",
            severity: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      <UserDialog
        open={editOpen}
        user={selectedUser}
        onClose={() => {
          setEditOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "User updated",
            severity: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        itemName={
          selectedUser
            ? `${selectedUser.FIRST_NAME} ${selectedUser.LAST_NAME}`
            : undefined
        }
        loading={deleteMutation.isPending}
        onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.ID)}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedUser(null);
        }}
      />

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
