import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import MainCard from "../../Components/MainCard";
import { useAuth } from "../../Context/AuthContext";
import { patientAPI, questionAPI, UploadEmployeeFiles } from "../../Api/api";

// ==============================|| STYLED COMPONENTS ||============================== //

const ColorButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
  border: 0,
  borderRadius: 25,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .2)",
  color: "white",
  height: 48,
  padding: "0 30px",
  "&:hover": {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  },
}));

const StyledMainCard = styled(MainCard)(({ theme }) => ({
  borderRadius: 16,
  borderLeft: `6px solid ${alpha(theme.palette.primary.main, 0.7)}`,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
}));

const NavigationButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: "8px 24px",
  fontWeight: 600,
  textTransform: "none",
}));

// ==============================|| PATIENT ONBOARDING JOURNEY ||============================== //

const PatientSurvey = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [capturedImages, setCapturedImages] = useState({
    "Front View": null,
    "Side View (Left)": null,
    "Side View (Right)": null,
  });
  const [imagePaths, setImagePaths] = useState({
    "Front View": null,
    "Side View (Left)": null,
    "Side View (Right)": null,
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentCaptureLabel, setCurrentCaptureLabel] = useState("");
  const [specifyTexts, setSpecifyTexts] = useState({});
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
    },
    answers: {},
    consents: {},
  });

  // Group questions by QuestionId
  const groupedQuestions = questions.reduce((acc, question) => {
    // Skip if we've already processed this QuestionId
    if (acc[question.QuestionId]) {
      // Only add the option if it doesn't exist
      const optionExists = acc[question.QuestionId].Options.some(
        (opt) => opt.OptionId === question.OptionId
      );
      if (!optionExists) {
        acc[question.QuestionId].Options.push({
          OptionId: question.OptionId,
          OptionText: question.OptionText,
          DisplayOrder: question.DisplayOrder1,
        });
      }
      return acc;
    }

    // New question entry
    acc[question.QuestionId] = {
      QuestionId: question.QuestionId,
      QuestionText: question.QuestionText,
      QuestionType: question.QuestionType,
      DisplayOrder: question.DisplayOrder,
      Options: [
        {
          OptionId: question.OptionId,
          OptionText: question.OptionText,
          DisplayOrder: question.DisplayOrder1,
        },
      ],
    };
    return acc;
  }, {});

  const sortedQuestions = Object.values(groupedQuestions).sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder
  );

  // Add this debug log
  console.log("GROUPED QUESTIONS STRUCTURE:", {
    groupedQuestions,
    sortedQuestions,
    questionCount: questions.length,
    groupedQuestionCount: Object.keys(groupedQuestions).length,
  });

  useEffect(() => {
    console.log("Component has mounted or state has changed");
  }, [sortedQuestions, currentStep]);

  useEffect(() => {
    const fetchQuestions = async () => {
      console.log("fetchQuestions called");
      try {
        setLoading(true);
        const response = await questionAPI.getQuestionAndOptionList();
        if (response.data.success) {
          setQuestions(response.data.data);

          console.log("Raw API Data:", response.data.data);

          const initialAnswers = {};
          const initialConsents = {};
          response.data.data.forEach((q) => {
            if (q.QuestionType === "multiple_choice") {
              initialAnswers[q.QuestionId] = [];
            } else if (q.QuestionType === "single_choice") {
              initialAnswers[q.QuestionId] = "";
            }

            if (
              q.QuestionText.includes("consent") ||
              q.QuestionText.includes("agree")
            ) {
              initialConsents[q.QuestionId] = false;
            }
          });

          setFormData((prev) => ({
            ...prev,
            answers: initialAnswers,
            consents: initialConsents,
          }));
        } else {
          throw new Error(response.data.message || "Failed to load questions");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load survey questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (event, label) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result.split(",")[1];
        const imageData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "PatientImages",
          AssignmentTitle: label.replace(/\s+/g, ""),
          Path: "Assets/PatientImages/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setCapturedImages((prev) => ({
            ...prev,
            [label]: e.target.result,
          }));
          setImagePaths((prev) => ({
            ...prev,
            [label]: response.data[0],
          }));
        } else {
          throw new Error(response.message || "Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleStartCamera = (label) => {
    setCurrentCaptureLabel(label);
    setShowCamera(true);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }
  };

  const handleCapturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/png");
      const base64String = imageDataUrl.split(",")[1];
      const fileName = `patient_${currentCaptureLabel.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}.png`;

      try {
        const imageData = {
          Image: `${fileName}|${base64String}`,
          fileName: fileName,
          fileType: "image/png",
        };

        const params = {
          SubjectName: "PatientImages",
          AssignmentTitle: currentCaptureLabel.replace(/\s+/g, ""),
          Path: "Assets/PatientImages/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setCapturedImages((prev) => ({
            ...prev,
            [currentCaptureLabel]: imageDataUrl,
          }));
          setImagePaths((prev) => ({
            ...prev,
            [currentCaptureLabel]: response.data[0],
          }));
        } else {
          throw new Error(
            response.message || "Failed to upload captured image"
          );
        }
      } catch (err) {
        console.error("Error uploading captured image:", err);
        setError("Failed to save captured image. Please try again.");
      }

      // Stop camera
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      setShowCamera(false);
    }
  };

  const handleCancelCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleAnswerChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  };

  const handleCheckboxChange = (questionId, optionId, isChecked) => {
    setFormData((prev) => {
      const currentAnswers = prev.answers[questionId] || [];
      let updatedAnswers;

      if (isChecked) {
        updatedAnswers = [...currentAnswers, optionId];
      } else {
        updatedAnswers = currentAnswers.filter((id) => id !== optionId);
      }

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: updatedAnswers,
        },
      };
    });
  };

  const handleConsentChange = (questionId, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      consents: {
        ...prev.consents,
        [questionId]: isChecked,
      },
    }));
  };

  const handleSpecifyTextChange = (questionId, text) => {
    setSpecifyTexts((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleSubmitConfirmation = () => {
    setOpenConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleSubmit = async () => {
    setOpenConfirmation(false);
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const userId = user?.UserId || parseInt(localStorage.getItem("userId"));
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Prepare responses array
      const responses = [];

      // Process all answered questions
      Object.entries(formData.answers).forEach(([questionId, answer]) => {
        const question = questions.find(
          (q) => q.QuestionId === parseInt(questionId)
        );

        if (question) {
          // For image question (ID 13)
          if (parseInt(questionId) === 13) {
            responses.push({
              QuestionId: 13,
              OptionId: [39, 40, 41]
                .filter((id) => {
                  if (id === 39 && imagePaths["Front View"]) return true;
                  if (id === 40 && imagePaths["Side View (Left)"]) return true;
                  if (id === 41 && imagePaths["Side View (Right)"]) return true;
                  return false;
                })
                .join(","),
              TextResponse: null,
              FrontSide: imagePaths["Front View"] || null,
              LeftSide: imagePaths["Side View (Left)"] || null,
              RightSide: imagePaths["Side View (Right)"] || null,
            });
          }
          // For all other questions
          else if (Array.isArray(answer) && answer.length > 0) {
            responses.push({
              QuestionId: parseInt(questionId),
              OptionId: answer.join(","),
              TextResponse: specifyTexts[questionId] || null,
              FrontSide: null,
              LeftSide: null,
              RightSide: null,
            });
          } else if (answer) {
            responses.push({
              QuestionId: parseInt(questionId),
              OptionId: answer.toString(),
              TextResponse: specifyTexts[questionId] || null,
              FrontSide: null,
              LeftSide: null,
              RightSide: null,
            });
          }
        }
      });

      // Prepare the final submission payload
      const submissionData = {
        UserId: userId,
        Responses: responses,
      };

      console.log("Submitting data:", submissionData); // For debugging

      // Call the patient service to save the application
      const response = await patientAPI.savePatientApplication(submissionData);

      if (response.success) {
        setSubmitSuccess(true);
        // Optionally reset form or redirect
      } else {
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setSubmitError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep all your render functions the same until renderQuestionInput) ...

  const renderQuestionInput = (question) => {
    if (question.QuestionId === 13) {
      // Special handling for the image upload question
      return (
        <Stack spacing={2}>
          {showCamera ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: "#6a1b9a" }}>
                Capturing: {currentCaptureLabel}
              </Typography>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", borderRadius: "12px" }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleCapturePhoto}
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#7b1fa2" },
                  }}
                >
                  Capture Photo
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelCamera}
                  sx={{
                    color: "#6a1b9a",
                    borderColor: "#6a1b9a",
                    "&:hover": { borderColor: "#6a1b9a" },
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {question.Options.map((option) => (
                <Stack key={option.OptionId} spacing={1}>
                  {capturedImages[option.OptionText] && (
                    <img
                      src={capturedImages[option.OptionText]}
                      alt={`Captured ${option.OptionText}`}
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        border: `1px solid ${alpha("#6a1b9a", 0.3)}`,
                      }}
                    />
                  )}
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      component="label"
                      sx={{
                        borderColor: alpha("#6a1b9a", 0.3),
                        color: "#6a1b9a",
                        "&:hover": {
                          borderColor: "#6a1b9a",
                          backgroundColor: alpha("#6a1b9a", 0.04),
                        },
                      }}
                    >
                      Upload {option.OptionText}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleFileUpload(e, option.OptionText)}
                      />
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => handleStartCamera(option.OptionText)}
                      sx={{
                        borderColor: alpha("#6a1b9a", 0.3),
                        color: "#6a1b9a",
                        "&:hover": {
                          borderColor: "#6a1b9a",
                          backgroundColor: alpha("#6a1b9a", 0.04),
                        },
                      }}
                    >
                      Capture {option.OptionText}
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      );
    }

    switch (question.QuestionType) {
      case "multiple_choice":
        return (
          <Grid container spacing={1}>
            {question.Options.map((option) => (
              <Grid item xs={12} sm={6} key={option.OptionId}>
                <FormControlLabel
                  control={
                    <StyledCheckbox
                      size="small"
                      checked={
                        formData.answers[question.QuestionId]?.includes(
                          option.OptionId
                        ) || false
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          question.QuestionId,
                          option.OptionId,
                          e.target.checked
                        )
                      }
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {option.OptionText}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        );
      case "single_choice":
        return (
          <FormControl component="fieldset">
            <RadioGroup
              aria-label={question.QuestionText}
              name={`radio-group-${question.QuestionId}`}
              value={formData.answers[question.QuestionId] || ""}
              onChange={(e) => {
                handleAnswerChange(question.QuestionId, e.target.value);
                if (
                  e.target.value !== "yes" &&
                  specifyTexts[question.QuestionId]
                ) {
                  handleSpecifyTextChange(question.QuestionId, "");
                }
              }}
            >
              {question.Options.map((option) => (
                <Box key={option.OptionId} sx={{ mb: 1 }}>
                  <FormControlLabel
                    value={option.OptionId}
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        {option.OptionText}
                      </Typography>
                    }
                  />
                  {option.OptionText.toLowerCase().includes("yes") &&
                    formData.answers[question.QuestionId] ===
                      option.OptionId && (
                      <StyledTextField
                        fullWidth
                        size="small"
                        label="Please specify"
                        variant="outlined"
                        value={specifyTexts[question.QuestionId] || ""}
                        onChange={(e) =>
                          handleSpecifyTextChange(
                            question.QuestionId,
                            e.target.value
                          )
                        }
                        sx={{ mt: 1, ml: 4 }}
                      />
                    )}
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={3} sx={{ background: "#fafafa" }}>
      <Grid xs={12}>
        <Stack sx={{ gap: 3 }}>
          <StyledMainCard
            title="Patient Onboarding Journey"
            sx={{ background: "linear-gradient(to right, #ffffff, #f8f5ff)" }}
          >
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                From Skin Concerns to Personalized Care
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                At Skin & Soul, our mission is to give you skincare that
                actually works—customized for your unique skin and your
                real-life routine. This journey begins with understanding you.
                Here's how we guide you through a smooth, thoughtful
                registration process that leads to the right treatment, the
                right product, and results you can trust.
              </Typography>
            </Stack>
          </StyledMainCard>

          {currentStep === 1 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 1: Let's Get to Know You
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Before we talk about products or treatments, we start with your
                story. We ask for basic personal info to keep your account
                secure and allow our experts to follow up, if needed.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <StyledTextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  variant="outlined"
                  value={formData.personalInfo.fullName}
                  onChange={(e) =>
                    handlePersonalInfoChange("fullName", e.target.value)
                  }
                />
                <StyledTextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date of Birth"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formData.personalInfo.dob}
                  onChange={(e) =>
                    handlePersonalInfoChange("dob", e.target.value)
                  }
                />
                <FormControl component="fieldset">
                  <FormLabel
                    component="legend"
                    sx={{ color: "#6a1b9a", mb: 1 }}
                  >
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-label="gender"
                    name="gender"
                    value={formData.personalInfo.gender}
                    onChange={(e) =>
                      handlePersonalInfoChange("gender", e.target.value)
                    }
                  >
                    <FormControlLabel
                      value="female"
                      control={<Radio size="small" />}
                      label="Female"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio size="small" />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio size="small" />}
                      label="Other"
                    />
                    <FormControlLabel
                      value="prefer-not-to-say"
                      control={<Radio size="small" />}
                      label="Prefer not to say"
                    />
                  </RadioGroup>
                </FormControl>
                <StyledTextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  variant="outlined"
                  value={formData.personalInfo.phone}
                  onChange={(e) =>
                    handlePersonalInfoChange("phone", e.target.value)
                  }
                />
                <StyledTextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Email Address"
                  variant="outlined"
                  value={formData.personalInfo.email}
                  onChange={(e) =>
                    handlePersonalInfoChange("email", e.target.value)
                  }
                />
                <StyledTextField
                  fullWidth
                  size="small"
                  label="Residential Address"
                  variant="outlined"
                  value={formData.personalInfo.address}
                  onChange={(e) =>
                    handlePersonalInfoChange("address", e.target.value)
                  }
                />
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 2 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 2: Tell Us About Your Skin
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                What you're experiencing matters deeply to us. The more we
                understand your skin's journey, the better we can support it.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {sortedQuestions
                  .filter((q) => q.DisplayOrder <= 7 && q.QuestionId !== 13) // Exclude QuestionId 13
                  .map((question) => (
                    <React.Fragment key={question.QuestionText}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 3 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 3: Your Lifestyle + Habits
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Your daily life plays a major role in your skin's health. This
                part helps us understand what your skin goes through every day.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {sortedQuestions
                  .filter(
                    (q) =>
                      q.DisplayOrder > 7 &&
                      q.DisplayOrder <= 12 &&
                      q.QuestionId !== 13 // Exclude QuestionId 13
                  )
                  .map((question) => (
                    <React.Fragment key={question.QuestionText}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 4 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 4: Ready for Your Treatment Plan
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Once we understand your skin, health, and lifestyle, it's time
                to begin your personalized plan.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Only include QuestionId 13 in Step 4 */}
                {sortedQuestions
                  .filter((q) => q.QuestionId === 13) // Include QuestionId 13
                  .map((question) => (
                    <React.Fragment key={`image-${question.QuestionId}`}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}

                {/* Consent checkboxes */}
                {sortedQuestions
                  .filter(
                    (q) =>
                      q.QuestionText.toLowerCase().includes("consent") ||
                      q.QuestionText.toLowerCase().includes("agree")
                  )
                  .map((question) => (
                    <FormControlLabel
                      key={`consent-${question.QuestionId}`}
                      control={
                        <StyledCheckbox
                          checked={
                            formData.consents[question.QuestionId] || false
                          }
                          onChange={(e) =>
                            handleConsentChange(
                              question.QuestionId,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={question.QuestionText}
                    />
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 5 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  What Happens Next?
                </Typography>
              }
              sx={{ background: "linear-gradient(to right, #ffffff, #f3e5f5)" }}
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Once your form is submitted:
              </Typography>
              <Stack spacing={1}>
                {[
                  "Expert dermatology review",
                  "Tailored treatment plan creation",
                  "Product compounding and delivery",
                  "Ongoing support available anytime",
                ].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#6a1b9a",
                        marginRight: 8,
                      }}
                    ></span>
                    {item}
                  </Typography>
                ))}
              </Stack>
              <Typography
                variant="body2"
                sx={{ mt: 2, color: "#6a1b9a", fontStyle: "italic" }}
              >
                Let's begin your journey toward clearer, healthier skin —
                together.
              </Typography>
            </StyledMainCard>
          )}

          {/* Navigation buttons */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <NavigationButton
              variant="outlined"
              disabled={currentStep === 1}
              onClick={handlePrevious}
              sx={{
                color: "#6a1b9a",
                borderColor: "#6a1b9a",
                "&:hover": {
                  backgroundColor: alpha("#6a1b9a", 0.04),
                  borderColor: "#6a1b9a",
                },
              }}
            >
              Back to previous question
            </NavigationButton>

            {currentStep < totalSteps ? (
              <NavigationButton
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": {
                    backgroundColor: "#7b1fa2",
                  },
                }}
              >
                Next Step
              </NavigationButton>
            ) : (
              <ColorButton
                fullWidth
                size="medium"
                onClick={handleSubmitConfirmation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{ color: "white", mr: 1 }}
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit Your Information"
                )}
              </ColorButton>
            )}
          </Stack>

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}

          <StyledMainCard>
            <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
              Your trust means everything to us. At Skin & Soul, we're
              committed to protecting your personal information.
            </Typography>
            <Divider sx={{ my: 2, borderColor: alpha("#6a1b9a", 0.2) }} />
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#6a1b9a", fontWeight: 500 }}
            >
              How We Use Your Personal Information
            </Typography>
            <Stack spacing={1}>
              {[
                "Understand your skin concerns and health history",
                "Provide a safe, personalized skincare plan",
                "Deliver your products to the right place",
                "Keep you updated on orders and product reminders",
                "Respond to your queries and support needs",
              ].map((item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: "#555", display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#6a1b9a",
                      marginRight: 8,
                    }}
                  ></span>
                  {item}
                </Typography>
              ))}
            </Stack>
            <Divider sx={{ my: 2, borderColor: alpha("#6a1b9a", 0.2) }} />
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#6a1b9a", fontWeight: 500 }}
            >
              What Information Do We Collect?
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              When you sign up or place an order, we may collect your Name,
              Email, Phone Number, Address, Skin Details, and Photos.
            </Typography>
          </StyledMainCard>
        </Stack>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmation}
        onClose={handleCloseConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "#6a1b9a" }}>
          Confirm Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to submit your application? Please review all
            information before submitting as you won't be able to make changes
            after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation} sx={{ color: "#6a1b9a" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            autoFocus
            sx={{
              backgroundColor: "#6a1b9a",
              color: "white",
              "&:hover": {
                backgroundColor: "#7b1fa2",
              },
            }}
          >
            Confirm Submission
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PatientSurvey;
