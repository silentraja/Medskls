import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";

export const ImageModal = ({
  imageUrl,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  currentIndex,
  totalImages,
  loading = false,
}) => {
  return (
    <Dialog
      open={!!imageUrl}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Navigation Arrows */}
      {hasPrev && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          sx={{
            position: "absolute",
            left: 30,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              transform: "translateY(-50%) scale(1.1)",
            },
            zIndex: 2,
            width: 60,
            height: 60,
            transition: "all 0.2s ease",
          }}
          size="large"
        >
          <ChevronLeft sx={{ fontSize: 40 }} />
        </IconButton>
      )}

      {hasNext && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          sx={{
            position: "absolute",
            right: 30,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              transform: "translateY(-50%) scale(1.1)",
            },
            zIndex: 2,
            width: 60,
            height: 60,
            transition: "all 0.2s ease",
          }}
          size="large"
        >
          <ChevronRight sx={{ fontSize: 40 }} />
        </IconButton>
      )}

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <img
          src={imageUrl}
          alt="Enlarged view"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      </DialogContent>

      {/* Footer with image counter */}
      <DialogActions
        sx={{
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.7)",
          py: 2,
          position: "relative",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: "white",
            position: "absolute",
            left: 20,
            bottom: 20,
          }}
        >
          {currentIndex + 1} / {totalImages}
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          startIcon={<Close />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.25)",
            },
          }}
        >
          Close Viewer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
