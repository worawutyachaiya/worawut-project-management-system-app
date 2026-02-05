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
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/services/departmentService";
import type { Department } from "@/types";
import DepartmentDialog from "@/components/departments/DepartmentDialog";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.search(),
  });

  const departments = data?.ResultOnDb || [];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    dept: Department,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDept(dept);
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
    mutationFn: (id: number) => departmentService.delete(id),
    onSuccess: (res) => {
      if (res.Status) {
        setSnackbar({
          open: true,
          message: "Department deleted successfully",
          severity: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
      } else {
        setSnackbar({
          open: true,
          message: res.Message || "Failed to delete",
          severity: "error",
        });
      }
      setDeleteOpen(false);
      setSelectedDept(null);
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
            Departments
          </Typography>
          <Typography color="text.secondary">
            Manage organization departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          New Department
        </Button>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load departments
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Members</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No departments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.ID} hover>
                    <TableCell>
                      <Typography fontFamily="monospace" fontWeight={500}>
                        {dept.CODE}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{dept.NAME}</Typography>
                    </TableCell>
                    <TableCell>{dept.DESCRIPTION || "-"}</TableCell>
                    <TableCell align="right">
                      {(dept as any).USER_COUNT || 0}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, dept)}>
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

      <DepartmentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Department created",
            severity: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["departments"] });
        }}
      />

      <DepartmentDialog
        open={editOpen}
        department={selectedDept}
        onClose={() => {
          setEditOpen(false);
          setSelectedDept(null);
        }}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "Department updated",
            severity: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["departments"] });
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        itemName={selectedDept?.NAME}
        loading={deleteMutation.isPending}
        onConfirm={() => selectedDept && deleteMutation.mutate(selectedDept.ID)}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedDept(null);
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
