import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  activeWorkspace?: [];
  description: string;
  name?: string;
  phoneNumber: string;
}

interface UserState {
  loggedUser: { email: string; id: string; token: string } | null;
  loading: boolean;
  userProfile: UserProfile | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  loggedUser: null,
  loading: false,
  userProfile: null,
  error: null,
  successMessage: null,
};

const axiosInstance = axios.create({
  baseURL: "https://daily-grid-rest-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Login User
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/login", credentials,);
      const { data } = response;

      const userData = data.data;

      Cookies.set(
        "user",
        JSON.stringify({
          email: userData.email,
          token: data.token,
          id: userData._id,
        }),
        { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message: error.response?.data.message || "Login failed",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);
// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    const userDetails = Cookies.get("user");
    let user = JSON.parse(userDetails || "");
    try {
      const response = await axiosInstance.get(`/userprofile/${user.id}`,{
        headers:{
          Authorization:`Bearer ${user.token}`
        }
      });
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message:
            error.response?.data.message || "Failed to fetch user profile",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);

// Signup User
export const signup = createAsyncThunk(
  "user/signup",
  async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/register", userData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message: error.response?.data.message || "Signup failed",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/forgotpassword", { email });
      return {
        message:
          response.data.message ||
          "Password reset link has been sent to your email.",
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message:
            error.response?.data.message || "Forgot Password Request failed",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/reset-password/${token}`, {
        newPassword,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message: error.response?.data.message || "Reset Password failed",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  "user/verifyOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/verifyotp", { email, otp });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          message: error.response?.data.message || "OTP Verification failed",
        });
      }
      return rejectWithValue({ message: "An unknown error occurred" });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      Cookies.remove("user");
      state.loggedUser = null;
      state.userProfile = null;
      state.successMessage = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loggedUser = {
          email: action.payload.email,
          id: action.payload._id,
          token: action.payload.token,
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message || "Login failed";
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message ||
          "Fetch user profile failed";
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || "Signup successful!";
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message || "Signup failed";
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message ||
          "Forgot Password Request failed";
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.successMessage = "Password reset successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message ||
          "Reset Password failed";
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string }).message ||
          "OTP Verification failed";
      });
  },
});

export const { logout, setLoading, setUserProfile, clearMessages } =
  userSlice.actions;
export default userSlice.reducer;
