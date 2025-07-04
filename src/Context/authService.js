import { authAPI, userAPI, patientAPI, questionAPI } from "../Api/api";

export const authService = {
  register: async (userData) => {
    try {
      const formattedDate = new Date(userData.dob).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const formData = new URLSearchParams();
      formData.append('Username', userData.username);
      formData.append('Email', userData.email);
      formData.append('Password', userData.password);
      formData.append('FullName', userData.fullName);
      formData.append('DOB', formattedDate);
      formData.append('Gender', userData.gender);
      formData.append('Mobile', userData.mobile);
      formData.append('PostalAddress', userData.address);

      const response = await authAPI.register(formData.toString());
      
      return {
        success: response.data?.Success || true,
        data: response.data,
        message: response.data?.Message || "Registration successful"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || 
               error.response?.data?.message || 
               "Registration failed",
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  adminRegister: async (adminData) => {
    try {
      const formattedDate = new Date(adminData.dob).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const formData = new URLSearchParams();
      formData.append('Username', adminData.username);
      formData.append('Email', adminData.email);
      formData.append('Password', adminData.password);
      formData.append('FullName', adminData.fullName);
      formData.append('DOB', formattedDate);
      formData.append('Gender', adminData.gender);
      formData.append('Mobile', adminData.mobile);
      formData.append('PostalAddress', adminData.address);
      formData.append('RoleID', adminData.roleID);

      const response = await authAPI.adminRegister(formData.toString());
      return {
        success: true,
        data: response.data,
        message: "Admin registration successful"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Admin registration failed",
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials.username, credentials.password);
      
      if (response.data.success) {
        const userData = response.data.data && response.data.data.length > 0 
          ? response.data.data[0] 
          : null;
        
        const token = userData?.Token || 'default-token-from-backend';
        
        return {
          success: true,
          data: userData,
          token: token,
          message: "Login successful"
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Invalid credentials"
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "An error occurred during login";
      
      if (error.isNetworkError) {
        errorMessage = "Network Error. Please check your internet connection.";
      } else if (error.isCorsError) {
        errorMessage = "CORS Error. Please contact support.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        isNetworkError: error.isNetworkError || false,
        isCorsError: error.isCorsError || false
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  } 
};

export const userService = {
  getUserList: async (userId) => {
    try {
      const response = await userAPI.getUserList(userId);
      return {
        success: true,
        data: response.data,
        message: "Users fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch users",
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await userAPI.deleteUser(userId);
      return {
        success: true,
        data: response.data,
        message: "User deleted successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user",
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const response = await userAPI.updateUserProfile(profileData);
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
        isNetworkError: error.isNetworkError || false
      };
    }
  }
};

export const patientService = {


  getPatientApplication: async (param) => {
    try {
      const response = await patientAPI.getPatientApplication(param);
      
      if (response.data?.Success) {
        return {
          success: true,
          data: response.data.Data,
          count: response.data.Count || 0,
          message: response.data.Message || "Patient application retrieved successfully"
        };
      } else {
        return {
          success: false,
          message: response.data?.Message || "No records found",
          statusCode: response.data?.StatusCode || "8004"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || 
               error.response?.data?.message || 
               error.message || 
               "An error occurred while fetching patient application",
        error: error.message,
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  updateUserApplication: async (params) => {
    try {
      const response = await patientAPI.updateUserApplication(params);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Application status updated successfully"
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "Failed to update application status",
          statusCode: response.data?.statusCode || "8004"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 
               error.message || 
               "Failed to update application status",
        error: error.message,
        isNetworkError: error.isNetworkError || false
      };
    }
  },

  getRoleWiseApplication: async (param) => {
    try {
      const response = await patientAPI.getRoleWiseApplication(param);
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          count: response.data.count || 0,
          message: response.data.message || "Applications retrieved successfully"
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "No records found",
          statusCode: response.data?.statusCode || "8004"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 
               error.message || 
               "Failed to fetch applications",
        error: error.message,
        isNetworkError: error.isNetworkError || false
      };
    }
  }
};

export const questionService = {
  getQuestionAndOptionList: async () => {
    try {
      const response = await questionAPI.getQuestionAndOptionList();
      return {
        success: true,
        data: response.data,
        message: "Questions fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch questions",
        isNetworkError: error.isNetworkError || false
      };
    }
  }
};