import {
  Box,
  ScrollArea,
  Typography,
  Combobox,
  ComboboxOption,
  Button,
  Main
} from '@strapi/design-system';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useIntl } from 'react-intl';
import DataTable from 'react-data-table-component';

const HomePage = () => {
  const { formatMessage } = useIntl();

  const baseUrl = process.env.STRAPI_ADMIN_BACKEND_URL;

  const [dropDownData, setDropDownData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [fileName, setFileName] = useState("");

  // Data table pagination
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/export-excel/dropdown-values`
        );
        setDropDownData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleComboboxChange = async (value) => {
    setSelectedValue(value);
    if (value) {
      fetchUsers(value, 1, 10);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/export-excel/download-excel`,
        {
          responseType: "arraybuffer",
          params: {
            uid: selectedValue,
          },
        }
      );

      if (response.data) {
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        setFileName(`file-${formattedDate}.xlsx`);

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `file-${formattedDate}.xlsx`;
        link.click();
        setIsSuccessMessage(true);
        setTimeout(() => {
          setIsSuccessMessage(false);
        }, 8000);
      }
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  const handleComboBoxClear = async () => {
    setSelectedValue(null);
    setTableData([]);
  };

  const columnRestructure = columns.map((property) => ({
    name: property?.charAt(0).toUpperCase() + property?.slice(1).replace(/_/g, " "),
    selector: (row) => row[property]?.toString(),
  }));

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  };

  const fetchUsers = async (value, page, newPerPage) => {
    setLoading(true);
    const currentSelectedValue = value;
    if (currentSelectedValue) {
      try {
        const offset = (page - 1) * newPerPage;
        const limit = newPerPage;

        const response = await axios.get(
          `${baseUrl}/api/export-excel/table-data?uid=${value}&limit=${limit}&offset=${offset}`
        );
        if (response?.data?.columns) {
          setColumns(response.data.columns);
        }
        if (response?.data?.data) {
          setTableData(response.data.data);
          setTotalRows(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    fetchUsers(selectedValue, page, perPage);
  };

  const handlePerRowsChange = async (newPerPage, currentPage) => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * newPerPage;
      const limit = newPerPage;

      const response = await axios.get(
        `${baseUrl}/api/export-excel/table-data?uid=${selectedValue}&limit=${limit}&offset=${offset}`
      );

      if (response?.data?.data) {
        setTableData(response.data.data);
        setPerPage(newPerPage);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Main>
      <Box background="neutral100" padding={4}>
        <Typography variant="delta" as="h2">
          Excel Download
        </Typography>
        <Box padding={4} width="600px" marginBottom={4}>
          <Combobox
            label="Collection Type"
            size="M"
            onChange={handleComboboxChange}
            value={selectedValue}
            placeholder="Select collection type"
            onClear={handleComboBoxClear}
          >
            {dropDownData?.data?.map((item) => (
              <ComboboxOption key={item.value} value={item.value}>
                {item.label}
              </ComboboxOption>
            ))}
          </Combobox>
        </Box>
        {selectedValue && (
          <Box>
            <Box padding={4} marginTop={2}>
              <Button size="L" variant="default" onClick={handleDownloadExcel}>
                Download
              </Button>
              {isSuccessMessage && (
                <Typography
                  style={{
                    color: 'green',
                    fontSize: 'medium',
                    fontWeight: '500',
                  }}
                >
                  Download completed: {fileName} successfully downloaded!
                </Typography>
              )}
            </Box>
            <div style={{ overflowY: "auto", width: "90vw", height: "100vh", padding: "0 16px" }}>
              <DataTable
                columns={columnRestructure}
                data={tableData}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                progressPending={loading}
              />
            </div>
          </Box>
        )}
      </Box>
    </Main>
  );
};

export { HomePage };
