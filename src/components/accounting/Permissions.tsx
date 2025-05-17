import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAccountingPermissions } from "../../contexts/AccountingPermissionsContext";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Switch, Box, FormControlLabel, TextField, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { useSnackbar } from "notistack";
import RefreshIcon from "@mui/icons-material/Refresh";
import MigrateIcon from "@mui/icons-material/Update";

interface User {
  id: string;
  email: string;
  displayName: string;
  roles?: {
    admin?: boolean;
    accountant?: boolean;
    specialist?: boolean;
  };
  // Legacy fields
  isAdmin?: boolean;
  isAccountant?: boolean;
}

const Permissions: React.FC = () => {
  const { isAdmin, isLoading: permissionsLoading } = useAccountingPermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [migratingLegacyRoles, setMigratingLegacyRoles] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!permissionsLoading && isAdmin) {
      fetchUsers();
    }
  }, [permissionsLoading, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      
      const usersData = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<User, "id">
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      enqueueSnackbar("Failed to load users data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, role: "admin" | "accountant" | "specialist") => {
    try {
      setUpdatingUserId(userId);
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) return;

      const userRef = doc(db, "users", userId);
      
      // Ensure roles object exists
      const roles = userToUpdate.roles || {};
      const updatedRoles = { 
        ...roles, 
        [role]: !roles[role] 
      };
      
      // Update in Firestore
      await updateDoc(userRef, {
        roles: updatedRoles,
      });

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            roles: updatedRoles
          };
        }
        return user;
      }));

      enqueueSnackbar(`Successfully updated permissions for ${userToUpdate.email || userToUpdate.displayName}`, { 
        variant: "success" 
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      enqueueSnackbar("Failed to update user permissions", { variant: "error" });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Function to migrate legacy roles to the new roles structure
  const migrateLegacyRoles = async () => {
    try {
      setMigratingLegacyRoles(true);
      
      // Find users with legacy roles
      const usersToMigrate = users.filter(user => 
        (user.isAdmin !== undefined || user.isAccountant !== undefined) && 
        (!user.roles || Object.keys(user.roles).length === 0)
      );
      
      if (usersToMigrate.length === 0) {
        enqueueSnackbar("No legacy roles to migrate", { variant: "info" });
        setMigratingLegacyRoles(false);
        return;
      }
      
      let migratedCount = 0;
      
      // Update each user with legacy roles
      for (const user of usersToMigrate) {
        const userRef = doc(db, "users", user.id);
        
        // Create roles object from legacy fields
        const roles = {
          admin: !!user.isAdmin,
          accountant: !!user.isAccountant,
        };
        
        await updateDoc(userRef, { roles });
        migratedCount++;
      }
      
      // Refresh users after migration
      await fetchUsers();
      
      enqueueSnackbar(`Successfully migrated ${migratedCount} users to the new roles system`, { 
        variant: "success" 
      });
    } catch (error) {
      console.error("Error migrating legacy roles:", error);
      enqueueSnackbar("Failed to migrate legacy roles", { variant: "error" });
    } finally {
      setMigratingLegacyRoles(false);
    }
  };

  // Check if user has legacy role fields that need migration
  const hasLegacyRoles = users.some(user => 
    (user.isAdmin !== undefined || user.isAccountant !== undefined) && 
    (!user.roles || Object.keys(user.roles).length === 0)
  );

  const getRoleValue = (user: User, role: "admin" | "accountant" | "specialist"): boolean => {
    // First check new role structure
    if (user.roles && user.roles[role] !== undefined) {
      return !!user.roles[role];
    }
    
    // Fall back to legacy fields if necessary
    if (role === "admin" && user.isAdmin !== undefined) {
      return user.isAdmin;
    }
    if (role === "accountant" && user.isAccountant !== undefined) {
      return user.isAccountant;
    }
    
    // Default to false if no role found
    return false;
  };

  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase().trim();
    if (!searchTerms) return true;
    
    return (
      (user.email && user.email.toLowerCase().includes(searchTerms)) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerms))
    );
  });

  if (permissionsLoading) {
    return <CircularProgress />;
  }

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, margin: "0 auto", mt: 4 }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1">
          You do not have permission to view this page. Only administrators can manage accounting permissions.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, margin: "0 auto", mt: 2 }}>
      <Typography variant="h5" gutterBottom>Accounting System Permissions</Typography>
      
      {hasLegacyRoles && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={migrateLegacyRoles}
              disabled={migratingLegacyRoles}
              startIcon={<MigrateIcon />}
            >
              {migratingLegacyRoles ? "Migrating..." : "Migrate Legacy Roles"}
            </Button>
          }
        >
          Some users have legacy role fields. Click to migrate them to the new role system.
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TextField
          label="Search users"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <Tooltip title="Refresh Users">
          <IconButton 
            onClick={fetchUsers}
            disabled={loading}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Accountant</TableCell>
                <TableCell>Specialist</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.displayName || "(No name)"}</TableCell>
                    <TableCell>{user.email || "(No email)"}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={getRoleValue(user, "admin")}
                            onChange={() => toggleRole(user.id, "admin")}
                            color="primary"
                            disabled={updatingUserId === user.id}
                          />
                        }
                        label=""
                      />
                      {updatingUserId === user.id && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={getRoleValue(user, "accountant")}
                            onChange={() => toggleRole(user.id, "accountant")}
                            color="primary"
                            disabled={updatingUserId === user.id}
                          />
                        }
                        label=""
                      />
                      {updatingUserId === user.id && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={getRoleValue(user, "specialist")}
                            onChange={() => toggleRole(user.id, "specialist")}
                            color="primary"
                            disabled={updatingUserId === user.id}
                          />
                        }
                        label=""
                      />
                      {updatingUserId === user.id && <CircularProgress size={16} sx={{ ml: 1 }} />}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default Permissions;