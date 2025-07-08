import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
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
  FormControl,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useAuth } from "../Context/AuthContext";
import { patientAPI, questionAPI, UploadEmployeeFiles } from "../Api/api";
import MainCard from "../Components/MainCard";
import {
  sendEmailNotification,
  newPatientSubmissionTemplate,
} from "../Services/emailService";

// Styled Components
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

const MultilineSpecifyField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    fontSize: "0.875rem",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease-in-out",
    "& textarea": {
      padding: "10px 12px",
      minHeight: "48px",
      resize: "vertical",
    },
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
  marginTop: 6,
  marginLeft: 32,
  width: "calc(100% - 64px)",
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

const PatientSurveyWithoutLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
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
  const [validationErrors, setValidationErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("");
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
  const groupedQuestions = useMemo(() => {
    return questions.reduce((acc, question) => {
      if (acc[question.QuestionId]) {
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
  }, [questions]);

  const sortedQuestions = useMemo(() => {
    return Object.values(groupedQuestions).sort(
      (a, b) => a.DisplayOrder - b.DisplayOrder
    );
  }, [groupedQuestions]);

  // Get questions for current step
  const getStepQuestions = useCallback(() => {
    if (currentStep === 1) {
      return sortedQuestions.filter(
        (q) => q.DisplayOrder <= 7 && q.QuestionId !== 13
      );
    } else if (currentStep === 2) {
      return sortedQuestions.filter(
        (q) => q.DisplayOrder > 7 && q.DisplayOrder <= 12 && q.QuestionId !== 13
      );
    } else if (currentStep === 3) {
      return sortedQuestions.filter(
        (q) =>
          q.QuestionId === 13 ||
          q.QuestionText.toLowerCase().includes("consent") ||
          q.QuestionText.toLowerCase().includes("agree")
      );
    }
    return [];
  }, [currentStep, sortedQuestions]);

  const stepQuestions = getStepQuestions();
  const currentQuestion = stepQuestions[questionIndex];
  const totalQuestionsInStep = stepQuestions.length;

  // Save form data to localStorage
  const saveFormDataLocally = useCallback(() => {
    const formDataToSave = {
      formData,
      specifyTexts,
      imagePaths,
      capturedImages,
      questions,
      groupedQuestions,
      currentStep,
      questionIndex
    };
    localStorage.setItem('pendingPatientSubmission', JSON.stringify(formDataToSave));
  }, [formData, specifyTexts, imagePaths, capturedImages, questions, groupedQuestions, currentStep, questionIndex]);

  // Load form data from localStorage
  const loadFormDataFromLocalStorage = useCallback(() => {
    const savedData = localStorage.getItem('pendingPatientSubmission');
    if (savedData) {
      try {
        const {
          formData: savedFormData,
          specifyTexts: savedSpecifyTexts,
          imagePaths: savedImagePaths,
          capturedImages: savedCapturedImages,
          questions: savedQuestions,
          groupedQuestions: savedGroupedQuestions,
          currentStep: savedCurrentStep,
          questionIndex: savedQuestionIndex
        } = JSON.parse(savedData);

        setFormData(savedFormData);
        setSpecifyTexts(savedSpecifyTexts);
        setImagePaths(savedImagePaths);
        setCapturedImages(savedCapturedImages);
        setQuestions(savedQuestions);
        setCurrentStep(savedCurrentStep || 1);
        setQuestionIndex(savedQuestionIndex || 0);
        
        localStorage.removeItem('pendingPatientSubmission');
        return true;
      } catch (err) {
        console.error("Error loading saved form data:", err);
        localStorage.removeItem('pendingPatientSubmission');
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // First try to load any saved data
        const hasSavedData = loadFormDataFromLocalStorage();
        
        if (!hasSavedData) {
          const response = await questionAPI.getQuestionAndOptionList();
          if (response.data.success) {
            setQuestions(response.data.data);

            const initialAnswers = {};
            const initialConsents = {};
            const initialSpecifyTexts = {};

            response.data.data.forEach((q) => {
              if (q.QuestionType === "multiple_choice") {
                initialAnswers[q.QuestionId] = [];
              } else if (q.QuestionType === "single_choice") {
                initialAnswers[q.QuestionId] = "";
              }

              if (
                q.OptionText.includes("(please specify)") ||
                q.OptionText.includes("(please list)")
              ) {
                initialSpecifyTexts[`${q.QuestionId}_${q.OptionId}`] = "";
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
            setSpecifyTexts(initialSpecifyTexts);
          }
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load survey questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [loadFormDataFromLocalStorage]);

  // Check for pending submission when user logs in
  useEffect(() => {
    if (user?.UserId) {
      const pendingSubmission = localStorage.getItem('pendingPatientSubmission');
      if (pendingSubmission) {
        setOpenConfirmation(true);
      }
    }
  }, [user]);

  const validateCurrentQuestion = () => {
    const errors = {};
    let isValid = true;

    if (!currentQuestion) return { isValid: true, errors };

    if (
      currentQuestion.QuestionText.toLowerCase().includes("consent") ||
      currentQuestion.QuestionText.toLowerCase().includes("agree")
    ) {
      if (!formData.consents[currentQuestion.QuestionId]) {
        errors[currentQuestion.QuestionId] = "You must agree to continue";
        isValid = false;
      }
      setValidationErrors(errors);
      return { isValid, errors };
    }

    if (currentQuestion.QuestionId === 13) {
      if (
        !imagePaths["Front View"] ||
        !imagePaths["Side View (Left)"] ||
        !imagePaths["Side View (Right)"]
      ) {
        errors[currentQuestion.QuestionId] = "Please upload all required images";
        isValid = false;
      }
      setValidationErrors(errors);
      return { isValid, errors };
    }

    const answer = formData.answers[currentQuestion.QuestionId];
    if (
      (!answer ||
        (Array.isArray(answer) && answer.length === 0) ||
        answer === "") &&
      currentQuestion.QuestionType !== "consent"
    ) {
      errors[currentQuestion.QuestionId] = "This question is required";
      isValid = false;
    }

    if (
      currentQuestion.QuestionType === "multiple_choice" &&
      Array.isArray(answer)
    ) {
      answer.forEach((optionId) => {
        const option = currentQuestion.Options.find(
          (opt) => opt.OptionId === optionId
        );
        if (
          option &&
          (option.OptionText.includes("(please specify)") ||
            option.OptionText.includes("(please list)")) &&
          !specifyTexts[`${currentQuestion.QuestionId}_${optionId}`]?.trim()
        ) {
          errors[`${currentQuestion.QuestionId}_${optionId}`] =
            "Please provide details";
          isValid = false;
        }
      });
    } else if (
      currentQuestion.QuestionType === "single_choice" &&
      typeof answer === "number"
    ) {
      const option = currentQuestion.Options.find((opt) => opt.OptionId === answer);
      if (
        option &&
        (option.OptionText.includes("(please specify)") ||
          option.OptionText.includes("(please list)")) &&
        !specifyTexts[currentQuestion.QuestionId]?.trim()
      ) {
        errors[currentQuestion.QuestionId] = "Please provide details";
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return { isValid, errors };
  };

  const scrollToFirstError = () => {
    const firstErrorKey = Object.keys(validationErrors)[0];
    if (firstErrorKey) {
      const element = document.getElementById(`question-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.boxShadow = "0 0 0 2px rgba(244, 67, 54, 0.5)";
        setTimeout(() => {
          element.style.boxShadow = "none";
        }, 2000);
      }
    }
  };

  const handleNextQuestion = () => {
    const { isValid } = validateCurrentQuestion();
    
    if (isValid) {
      if (questionIndex < totalQuestionsInStep - 1) {
        setQuestionIndex(questionIndex + 1);
      } else {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
          setQuestionIndex(0);
        }
      }
      setValidationErrors({});
    } else {
      setSnackbarType("error");
      setSnackbarMessage(
        "Please complete all required fields before proceeding"
      );
      setOpenSnackbar(true);
      scrollToFirstError();
    }
  };

  const handlePreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        const prevStepQuestions = getStepQuestions();
        setQuestionIndex(prevStepQuestions.length - 1);
      }
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
        }
      } catch (err) {
        console.error("Error uploading captured image:", err);
        setError("Failed to save captured image. Please try again.");
      }

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

  const handleAnswerChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: Number(value),
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

  const handleSpecifyTextChange = useCallback((key, value) => {
    setSpecifyTexts((prev) => {
      if (/^\d+$/.test(key)) {
        return { ...prev, [key]: value };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleSubmitConfirmation = () => {
    const { isValid } = validateCurrentQuestion();
    
    if (isValid) {
      setOpenConfirmation(true);
    } else {
      setSnackbarMessage(
        "Please complete the current question before submitting"
      );
      setOpenSnackbar(true);
    }
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
        // User is not logged in - save data and redirect to register
        saveFormDataLocally();
        navigate('/register', {
          state: {
            fromSurvey: true,
            surveyData: {
              personalInfo: formData.personalInfo
            }
          }
        });
        return;
      }

      // User is logged in - proceed with submission
      const responses = [];

      Object.entries(formData.answers).forEach(([questionId, answer]) => {
        const question = groupedQuestions[questionId];
        if (!question) return;

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
        } else if (Array.isArray(answer) && answer.length > 0) {
          const textResponses = answer.map((optionId) => {
            const key = `${questionId}_${optionId}`;
            const option =
              question.Options?.find((opt) => opt.OptionId === optionId) || {};
            const needsSpecify =
              option.OptionText?.includes("(please specify)") ||
              option.OptionText?.includes("(please list)");

            return {
              optionId,
              text: needsSpecify ? specifyTexts[key] || null : null,
            };
          });

          responses.push({
            QuestionId: parseInt(questionId),
            OptionId: answer.join(","),
            TextResponse: textResponses
              .filter((res) => res.text !== null)
              .map((res) => res.text)
              .join("; "),
            FrontSide: null,
            LeftSide: null,
            RightSide: null,
          });
        } else if (answer) {
          const option =
            question.Options?.find((opt) => opt.OptionId === answer) || {};
          const needsSpecify =
            option.OptionText?.includes("(please specify") ||
            option.OptionText?.includes("(please list)");

          responses.push({
            QuestionId: parseInt(questionId),
            OptionId: answer.toString(),
            TextResponse: needsSpecify
              ? specifyTexts[questionId] || null
              : null,
            FrontSide: null,
            LeftSide: null,
            RightSide: null,
          });
        }
      });

      const submissionData = {
        UserId: userId,
        Responses: responses.filter(
          (res) => res.OptionId && res.OptionId.length > 0
        ),
      };

      const response = await patientAPI.savePatientApplication(submissionData);
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to submit application"
        );
      }

      setSubmitSuccess(true);
      setSubmitError(null);
      setSnackbarType("success");

      // Send email notification
      const patientName = formData.personalInfo.fullName || "New Patient";
      const template = newPatientSubmissionTemplate(patientName);

      const emailResult = await sendEmailNotification({
        recipientRoles: ["Physician", "Admin"],
        subject: template.subject,
        messageBody: template.messageBody,
        patientName,
      });

      if (emailResult.success) {
        setSnackbarMessage(
          `Thank you for your submission! ${emailResult.sentCount} doctor(s) notified.`
        );
      } else {
        setSnackbarMessage(
          "Thank you for your submission! Our team will review your information."
        );
        console.warn("Email notification issues:", emailResult.message);
      }

      setOpenSnackbar(true);
      
      // Clear form after successful submission
      setFormData({
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
      setSpecifyTexts({});
      setImagePaths({
        "Front View": null,
        "Side View (Left)": null,
        "Side View (Right)": null,
      });
      setCapturedImages({
        "Front View": null,
        "Side View (Left)": null,
        "Side View (Right)": null,
      });

    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Failed to submit application");
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = useCallback(
    (question) => {
      const needsSpecifyField = (optionText) => {
        return /\(please (specify|list)\)/i.test(optionText);
      };

      if (question.QuestionId === 13) {
        return (
          <Box
            id={`question-${question.QuestionId}`}
            sx={{
              border: validationErrors[question.QuestionId]
                ? "1px solid #f44336"
                : "none",
              borderRadius: "8px",
              padding: validationErrors[question.QuestionId] ? "16px" : "0",
              backgroundColor: validationErrors[question.QuestionId]
                ? "rgba(244, 67, 54, 0.04)"
                : "transparent",
            }}
          >
            {validationErrors[question.QuestionId] && (
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                {validationErrors[question.QuestionId]}
              </Typography>
            )}
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
                            onChange={(e) =>
                              handleFileUpload(e, option.OptionText)
                            }
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
          </Box>
        );
      }

      switch (question.QuestionType) {
        case "multiple_choice":
          return (
            <Box
              id={`question-${question.QuestionId}`}
              sx={{
                border: validationErrors[question.QuestionId]
                  ? "1px solid #f44336"
                  : "none",
                borderRadius: "8px",
                padding: validationErrors[question.QuestionId] ? "16px" : "0",
                backgroundColor: validationErrors[question.QuestionId]
                  ? "rgba(244, 67, 54, 0.04)"
                  : "transparent",
              }}
            >
              {validationErrors[question.QuestionId] && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {validationErrors[question.QuestionId]}
                </Typography>
              )}
              <Grid container spacing={1}>
                {question.Options.map((option) => {
                  const isSelected = formData.answers[
                    question.QuestionId
                  ]?.includes(option.OptionId);
                  const shouldShowSpecify =
                    isSelected && needsSpecifyField(option.OptionText);

                  return (
                    <Grid item xs={12} key={option.OptionId}>
                      <Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                handleCheckboxChange(
                                  question.QuestionId,
                                  option.OptionId,
                                  e.target.checked
                                );
                                if (!e.target.checked) {
                                  handleSpecifyTextChange(
                                    `${question.QuestionId}_${option.OptionId}`,
                                    ""
                                  );
                                }
                              }}
                            />
                          }
                          label={option.OptionText}
                        />
                        {shouldShowSpecify && (
                          <MultilineSpecifyField
                            multiline
                            minRows={2}
                            placeholder="Please specify..."
                            variant="outlined"
                            value={
                              specifyTexts[
                                `${question.QuestionId}_${option.OptionId}`
                              ] || ""
                            }
                            onChange={(e) =>
                              handleSpecifyTextChange(
                                `${question.QuestionId}_${option.OptionId}`,
                                e.target.value
                              )
                            }
                            error={
                              !!validationErrors[
                                `${question.QuestionId}_${option.OptionId}`
                              ]
                            }
                            helperText={
                              validationErrors[
                                `${question.QuestionId}_${option.OptionId}`
                              ]
                            }
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          );

        case "single_choice":
          return (
            <Box
              id={`question-${question.QuestionId}`}
              sx={{
                border: validationErrors[question.QuestionId]
                  ? "1px solid #f44336"
                  : "none",
                borderRadius: "8px",
                padding: validationErrors[question.QuestionId] ? "16px" : "0",
                backgroundColor: validationErrors[question.QuestionId]
                  ? "rgba(244, 67, 54, 0.04)"
                  : "transparent",
              }}
            >
              {validationErrors[question.QuestionId] && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {validationErrors[question.QuestionId]}
                </Typography>
              )}
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={formData.answers[question.QuestionId] || ""}
                  onChange={(e) => {
                    handleAnswerChange(question.QuestionId, e.target.value);
                    const selectedOption = question.Options.find(
                      (opt) => opt.OptionId === Number(e.target.value)
                    );
                    if (
                      !selectedOption ||
                      !needsSpecifyField(selectedOption.OptionText)
                    ) {
                      handleSpecifyTextChange(question.QuestionId, "");
                    }
                  }}
                >
                  {question.Options.map((option) => {
                    const isSelected =
                      Number(formData.answers[question.QuestionId]) ===
                      option.OptionId;
                    const shouldShowSpecify =
                      isSelected && needsSpecifyField(option.OptionText);

                    return (
                      <Box key={option.OptionId} sx={{ mb: 0.5 }}>
                        <FormControlLabel
                          value={option.OptionId}
                          control={<Radio size="small" />}
                          label={option.OptionText}
                        />
                        {shouldShowSpecify && (
                          <MultilineSpecifyField
                            fullWidth
                            size="small"
                            placeholder="Please specify..."
                            variant="outlined"
                            value={specifyTexts[question.QuestionId] || ""}
                            onChange={(e) =>
                              handleSpecifyTextChange(
                                question.QuestionId,
                                e.target.value
                              )
                            }
                            error={!!validationErrors[question.QuestionId]}
                            helperText={validationErrors[question.QuestionId]}
                          />
                        )}
                      </Box>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Box>
          );
        default:
          return null;
      }
    },
    [
      formData.answers,
      specifyTexts,
      showCamera,
      capturedImages,
      validationErrors,
      currentCaptureLabel,
    ]
  );

  const renderProgressIndicator = () => {
    if (currentStep >= 1 && currentStep <= 3) {
      return (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Question {questionIndex + 1} of {totalQuestionsInStep} in this section
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 5 }}>
              <Box 
                sx={{ 
                  height: 8, 
                  bgcolor: '#6a1b9a', 
                  borderRadius: 5, 
                  width: `${((questionIndex + 1) / totalQuestionsInStep) * 100}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round(((questionIndex + 1) / totalQuestionsInStep) * 100)}%
            </Typography>
          </Box>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 0.5 }}>
            Section {currentStep} of 3: {currentStep === 1 ? "Skin Concerns" : currentStep === 2 ? "Lifestyle" : "Consents"}
          </Typography>
        </Box>
      );
    }
    return null;
  };

return (
  <Grid container spacing={3} sx={{ background: "#fafafa" }}>
    <Grid item xs={12}>
      <Stack sx={{ gap: 3 }}>
        {/* Show alert if returning with saved data */}
        {user?.UserId && localStorage.getItem('pendingPatientSubmission') && (
          <Alert severity="info" sx={{ mb: 2 }}>
            We found your saved survey data. Please review and submit.
          </Alert>
        )}

        {/* Intro Card - Only shown on first question of first step */}
        {currentStep === 1 && questionIndex === 0 && (
          <StyledMainCard
            title="Patient Onboarding Journey"
            sx={{ background: "linear-gradient(to right, #ffffff, #f8f5ff)" }}
          >
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                From Skin Concerns to Personalized Care
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                At Medskls Apothecary, our mission is to give you skincare that
                actually works—customized for your unique skin and your real-life
                routine. This journey begins with understanding you. Here's how
                we guide you through a smooth, thoughtful registration process
                that leads to the right treatment, the right product, and results
                you can trust.
              </Typography>
            </Stack>
          </StyledMainCard>
        )}

        {/* Current Question Card */}
        {currentStep <= 3 && currentQuestion && (
          <StyledMainCard
            title={
              <Typography variant="h5" sx={{ color: "#6a1b9a", fontWeight: 600 }}>
                {currentStep === 1
                  ? "Tell Us About Your Skin"
                  : currentStep === 2
                  ? "Your Lifestyle + Habits"
                  : "Ready for Your Treatment Plan"}
              </Typography>
            }
          >
            {renderProgressIndicator()}

            <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
              {currentStep === 1 &&
                "What you're experiencing matters deeply to us. The more we understand your skin's journey, the better we can support it."}
              {currentStep === 2 &&
                "Your daily life plays a major role in your skin's health. This part helps us understand what your skin goes through every day."}
              {currentStep === 3 &&
                "We're ready to create your personalized treatment plan. Review your information and let's get started."}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Box key={currentQuestion.QuestionId} id={`question-${currentQuestion.QuestionId}`}>
                {currentQuestion.QuestionText.toLowerCase().includes("consent") ||
                currentQuestion.QuestionText.toLowerCase().includes("agree") ? (
                  <FormControlLabel
                    control={
                      <StyledCheckbox
                        checked={formData.consents[currentQuestion.QuestionId] || false}
                        onChange={(e) =>
                          handleConsentChange(
                            currentQuestion.QuestionId,
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={currentQuestion.QuestionText}
                  />
                ) : (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "#6a1b9a", fontWeight: 500, mb: 1 }}
                    >
                      {currentQuestion.QuestionText}
                    </Typography>
                    {renderQuestionInput(currentQuestion)}
                  </>
                )}
                {validationErrors[currentQuestion.QuestionId] && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {validationErrors[currentQuestion.QuestionId]}
                  </Typography>
                )}
              </Box>
            </Box>
          </StyledMainCard>
        )}

        {/* Final Step */}
        {currentStep === 4 && (
          <StyledMainCard
            title={
              <Typography variant="h5" sx={{ color: "#6a1b9a", fontWeight: 600 }}>
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
                  sx={{ color: "#555", display: "flex", alignItems: "center" }}
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
              Let's begin your journey toward clearer, healthier skin — together.
            </Typography>
          </StyledMainCard>
        )}

        {/* Navigation Buttons */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          {currentStep > 1 || questionIndex > 0 ? (
            <NavigationButton
              variant="outlined"
              onClick={handlePreviousQuestion}
              sx={{
                color: "#6a1b9a",
                borderColor: "#6a1b9a",
                "&:hover": {
                  backgroundColor: alpha("#6a1b9a", 0.04),
                  borderColor: "#6a1b9a",
                },
              }}
            >
              Back
            </NavigationButton>
          ) : (
            <div /> // Empty div for spacing
          )}

          {currentStep < 4 ? (
            <NavigationButton
              variant="contained"
              onClick={handleNextQuestion}
              sx={{
                backgroundColor: "#6a1b9a",
                "&:hover": { backgroundColor: "#7b1fa2" },
              }}
            >
              {questionIndex < totalQuestionsInStep - 1 ? "Next Question" : 
               currentStep < 3 ? "Continue to Next Section" : "Review Submission"}
            </NavigationButton>
          ) : (
            <ColorButton
              size="small"
              onClick={handleSubmitConfirmation}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                  Submitting...
                </>
              ) : (
                "Submit Your Information"
              )}
            </ColorButton>
          )}
        </Stack>

        {/* Privacy Card - Only shown on first question of first step */}
        {currentStep === 1 && questionIndex === 0 && (
          <StyledMainCard>
            <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
              Your trust means everything to us. At Medskls Apothecary, we're
              committed to protecting your personal information.
            </Typography>
            <Divider sx={{ my: 2, borderColor: alpha("#6a1b9a", 0.2) }} />
            <Typography variant="subtitle1" sx={{ color: "#6a1b9a", fontWeight: 500 }}>
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
            <Typography variant="subtitle1" sx={{ color: "#6a1b9a", fontWeight: 500 }}>
              What Information Do We Collect?
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              When you sign up or place an order, we may collect your Name, Email,
              Phone Number, Address, Skin Details, and Photos.
            </Typography>
          </StyledMainCard>
        )}
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
            "&:hover": { backgroundColor: "#7b1fa2" },
          }}
        >
          Confirm Submission
        </Button>
      </DialogActions>
    </Dialog>

    {/* Snackbar */}
    <Snackbar
      open={openSnackbar}
      autoHideDuration={5000}
      onClose={() => setOpenSnackbar(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setOpenSnackbar(false)}
        severity={snackbarType}
        sx={{
          width: "100%",
          backgroundColor: snackbarType === "success" ? "#4caf50" : "#f44336",
          color: "white",
          "& .MuiAlert-icon": { color: "white" },
        }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Grid>
);


};

export default PatientSurveyWithoutLogin;