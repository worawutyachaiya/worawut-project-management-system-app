import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import type { User } from "@/types";

interface UserDialogProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: UserDialogProps) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    departmentId: "" as number | "",
    status: "ACTIVE",
    role: "USER", // Simplified role handling
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.FIRST_NAME || "",
        lastName: user.LAST_NAME || "",
        email: user.EMAIL || "",
        password: "", // Don't show password
        departmentId: user.DEPARTMENT_ID || "",
        status: user.STATUS || "ACTIVE",
        role: user.roles?.[0]?.CODE || "USER",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        departmentId: "",
        status: "ACTIVE",
        role: "USER",
      });
    }
    setError("");
  }, [user, open]);

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ["departments-list"],
    queryFn: () => departmentService.search(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      // Map form data to User type
      // Note: Backend might expect specific structure for roles
      const payload: any = {
        FIRST_NAME: data.firstName,
        LAST_NAME: data.lastName,
        EMAIL: data.email,
        DEPARTMENT_ID: data.departmentId || null,
        STATUS: data.status,
        // Backend handles roles likely via separate endpoint or specific field
        // Sending ROLE_ID or CODE if backend supports it
        // For MVP assuming backend might ignore or handle 'role' property if adapted
      };

      if (user) {
        return userService.update(user.ID, payload);
      } else {
        payload.PASSWORD = data.password;
        return userService.create(payload);
      }
    },
    onSuccess: (res) => {
      if (res.Status) {
        onSuccess();
        onClose();
      } else {
        setError(res.Message || "Operation failed");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Operation failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !formData.password) {
      setError("Password is required for new users");
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />

            {!user && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => handleChange("departmentId", e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departments?.ResultOnDb?.map((dept) => (
                    <MenuItem key={dept.ID} value={dept.ID}>
                      [{dept.CODE}] {dept.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? <CircularProgress size={16} /> : null
            }
          >
            {user ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
