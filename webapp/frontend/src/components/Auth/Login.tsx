import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Container,
  Divider,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { LoginForm, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
      role: UserRole.PUBLIC,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(data);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setValue('email', 'guest@ca-lobby.gov');
    setValue('password', 'guest');
    setValue('role', UserRole.GUEST);
  };

  const roleDescriptions = {
    [UserRole.GUEST]: 'Basic data access and simple searches only',
    [UserRole.PUBLIC]: 'Advanced searches with limited export capabilities',
    [UserRole.RESEARCHER]: 'Full data access with custom reports and unlimited exports',
    [UserRole.JOURNALIST]: 'All researcher features plus bulk download capabilities',
    [UserRole.ADMIN]: 'Complete system access including user management',
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            textAlign: 'center',
            py: 4,
            mb: 4,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography component="h1" variant="h3" fontWeight="bold">
            California Lobbying
          </Typography>
          <Typography component="h2" variant="h5" sx={{ mt: 1 }}>
            Transparency Portal
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, opacity: 0.9 }}>
            Public access to lobbying data and financial disclosures
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 3, width: '100%', maxWidth: 900 }}>
          {/* Login Form */}
          <Card sx={{ flex: 1, maxWidth: 400 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography component="h2" variant="h5" fontWeight="bold" gutterBottom>
                Sign In
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />

                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Access Level</InputLabel>
                      <Select
                        {...field}
                        label="Access Level"
                        error={!!errors.role}
                      >
                        <MenuItem value={UserRole.PUBLIC}>Public User</MenuItem>
                        <MenuItem value={UserRole.RESEARCHER}>Researcher</MenuItem>
                        <MenuItem value={UserRole.JOURNALIST}>Journalist</MenuItem>
                        <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    or
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGuestAccess}
                  disabled={isLoading}
                  sx={{ mb: 2 }}
                >
                  Continue as Guest
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/register" variant="body2">
                    Don't have an account? Register here
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Access Levels
              </Typography>

              <Box sx={{ mt: 2 }}>
                {Object.entries(roleDescriptions).map(([role, description]) => (
                  <Box key={role} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      {description}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About This Portal
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                This portal provides public access to California lobbying data, including
                lobbyist registrations, employer disclosures, and payment records. Our goal
                is to promote transparency and accountability in government by making this
                information easily accessible to researchers, journalists, and the public.
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Data Sources:</strong> California Secretary of State lobbying database
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Updated:</strong> Data is refreshed daily
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            By using this portal, you agree to use the data responsibly and in accordance
            with applicable laws and regulations.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;