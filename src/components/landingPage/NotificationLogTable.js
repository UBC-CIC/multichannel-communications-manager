import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Paper,
  Box,
  Typography,
  Tooltip,
  Button,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";

const StyledTableCell = styled(TableCell)`
  color: #002145;
  font-weight: 500;
`;

const NotificationLogTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //sample hard coded mock notification entries to be replaced with queried data from database
  const sampleNotifications = [
    {
      date: "9/17/2022, 1:21 PM",
      name: "Free Rapid Tests for Workplace Screening",
      topic_of_interest: "Business and Industry",
      type: "Email",
    },
    {
      date: "9/17/2022, 12:59 PM",
      name: "Support for Self-Employed Individuals",
      topic_of_interest: "Business and Industry",
      type: "Email",
    },
    {
      date: "9/14/2022, 6:30 PM",
      name: "Guidance for Workplaces and Businesses",
      topic_of_interest: "Business and Industry",
      type: "Email",
    },
    {
      date: "9/13/2022, 9:32 AM",
      name: "Business Loans for Entrepreneurs",
      topic_of_interest: "Entrepreneurship",
      type: "Phone",
    },
    {
      date: "9/12/2022, 4:44 PM",
      name: "Budget Planner",
      topic_of_interest: "Money and Finances",
      type: "Phone",
    },
  ];
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [displayFilters, setDisplayFilters] = useState(false);
  const [selectedTopicOfInterestFilter, setSelectedTopicOfInterestFilter] =
    useState();
  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] =
    useState();

  // avoid a layout jump in the table when reaching the last page with empty rows
  let emptyRows =
    page <= 0
      ? 0
      : Math.max(0, (1 + page) * rowsPerPage - notifications.length);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    notifications && (
      <>
        <Typography variant="h5" sx={{ mb: "1em" }}>
          My Notification Log
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: displayFilters ? "space-between" : "flex-end",
            alignItems: "center",
            mb: "1em",
          }}
        >
          {displayFilters && (
            <Box>
              <FormControl sx={{ width: "200px", mr: "1em" }}>
                <InputLabel id="topic-of-interest-filter-label">
                  Topic of Interest
                </InputLabel>
                <Select
                  labelId="topic-of-interest-filter-label"
                  id="topic-of-interest-filter-select"
                  value={selectedTopicOfInterestFilter}
                  label="Select Topic of Interest"
                  // onChange={handleChange}
                >
                  {/* replace these with mapped topics of interest values from queried data for user */}
                  <MenuItem value={"Business and Industry"}>
                    Business and Industry
                  </MenuItem>
                  <MenuItem value={"Entrepreneurship"}>
                    Entrepreneurship
                  </MenuItem>
                  <MenuItem value={"Money and Finances"}>
                    Money and Finances
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ width: "200px" }}>
                <InputLabel id="notification-type-filter-label">
                  Notification Type
                </InputLabel>
                <Select
                  labelId="notification-type-filter-label"
                  id="notification-type-filter-select"
                  value={selectedNotificationTypeFilter}
                  label="Select Notification Type"
                  // onChange={handleChange}
                >
                  <MenuItem value={"Email"}>Email</MenuItem>
                  <MenuItem value={"Phone"}>Phone</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Tooltip title="Show Filters">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setDisplayFilters(!displayFilters)}
            >
              Filters
            </Button>
          </Tooltip>
        </Box>
        <TableContainer component={Paper}>
          <Table aria-label="update publications log table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Topic of Interest</StyledTableCell>
                <StyledTableCell>Type</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? notifications.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : notifications
              ).map((notification, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box
                      sx={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "150px",
                        overflow: "hidden",
                      }}
                    >
                      {notification.date}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "300px",
                        overflow: "hidden",
                      }}
                    >
                      {notification.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "300px",
                        overflow: "hidden",
                      }}
                    >
                      {notification.topic_of_interest}
                    </Box>
                  </TableCell>
                  <TableCell>{notification.type}</TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* render the correct pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          count={notifications && notifications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </>
    )
  );
};
export default NotificationLogTable;
