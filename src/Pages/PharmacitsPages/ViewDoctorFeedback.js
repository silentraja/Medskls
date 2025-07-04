import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import { AttachFile, Close } from "@mui/icons-material";

const ViewDoctorFeedback = ({ open, onClose, application }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = "https://portal.medskls.com:441/API";
    return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.info.main,
          color: theme.palette.common.white,
          fontWeight: 600,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <AttachFile />
        Doctor's Feedback & Prescription
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography my={2}>
            <strong>
              ID: {application?.application_id} -{" "}
              {application?.FullName || "N/A"}
            </strong>
          </Typography>
          <Typography variant="subtitle1">
            <strong>Title:</strong> {application?.application_title}
          </Typography>
        </Box>

        {/* Doctor's Feedback */}
        <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Doctor's Notes
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {application?.doctor_feedback || "No feedback provided"}
            </Typography>
          </CardContent>
        </Card>

        {/* Prescription Image */}
        {application?.doctor_prescription && (
          <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prescription Document
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <img
                  src={getImageUrl(application.doctor_prescription)}
                  alt="Doctor's Prescription"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: 1,
                    cursor: "pointer",
                    objectFit: "contain",
                  }}
                  onClick={() =>
                    setSelectedImage(
                      getImageUrl(application.doctor_prescription)
                    )
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                onClick={() =>
                  window.open(
                    getImageUrl(application.doctor_prescription),
                    "_blank"
                  )
                }
                sx={{ mt: 2 }}
              >
                View Full Size
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Image Modal for enlarged view */}
      {selectedImage && (
        <Dialog
          open={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            <img
              src={selectedImage}
              alt="Enlarged Prescription"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedImage(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};

export default ViewDoctorFeedback;
