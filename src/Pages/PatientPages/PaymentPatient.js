// PaymentPatient.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  Stack,
  Alert,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import {
  Payment,
  CreditCard,
  AccountBalance,
  Close,
  CheckCircle,
  Receipt,
} from "@mui/icons-material";
import { useTheme } from "@mui/material";

const PaymentPatient = ({ invoice, onClose }) => {
  const theme = useTheme();
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Payment processed successfully!",
        severity: "success",
      });
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Payment color="primary" />
            <Typography variant="h6" color="primary">
              Payment Method
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    border: "1px solid",
                    borderColor:
                      paymentMethod === "credit" ? "primary.main" : "divider",
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    value="credit"
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CreditCard color="primary" />
                        <Typography variant="body1">
                          Credit/Debit Card
                        </Typography>
                      </Stack>
                    }
                    sx={{ m: 0 }}
                  />

                  {paymentMethod === "credit" && (
                    <Box sx={{ mt: 2, pl: 4 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Card Number"
                            name="number"
                            value={cardDetails.number}
                            onChange={handleCardChange}
                            placeholder="1234 5678 9012 3456"
                            required
                            InputProps={{
                              endAdornment: (
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: "grey.200",
                                    borderRadius: "4px",
                                  }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Cardholder Name"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleCardChange}
                            placeholder="John Doe"
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Expiry Date"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="CVV"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            required
                            type="password"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor:
                      paymentMethod === "bank" ? "primary.main" : "divider",
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    value="bank"
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountBalance color="primary" />
                        <Typography variant="body1">Bank Transfer</Typography>
                      </Stack>
                    }
                    sx={{ m: 0 }}
                  />

                  {paymentMethod === "bank" && (
                    <Box
                      sx={{
                        mt: 2,
                        pl: 4,
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Please transfer the payment to the following account:
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Bank Name
                          </Typography>
                          <Typography variant="body2">
                            Healthcare Bank
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Account Name
                          </Typography>
                          <Typography variant="body2">
                            Medical Services Inc.
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Account Number
                          </Typography>
                          <Typography variant="body2">
                            1234 5678 9012 3456
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Reference
                          </Typography>
                          <Typography variant="body2">
                            {invoice?.application_id ||
                              "MED-" + Math.floor(Math.random() * 10000)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </RadioGroup>
            </FormControl>

            {/* <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? null : <CheckCircle />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {loading ? (
                  <>Processing Payment...</>
                ) : (
                  <>Confirm Payment of ${invoice?.final_amount || "0.00"}</>
                )}
              </Button>
            </Box> */}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          icon={<Receipt fontSize="inherit" />}
          sx={{
            width: "100%",
            alignItems: "center",
            boxShadow: 3,
          }}
        >
          <Typography variant="body1" fontWeight={500}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentPatient;
