"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const admin = require("@strapi/strapi/admin");
const reactRouterDom = require("react-router-dom");
const designSystem = require("@strapi/design-system");
const react = require("react");
const axios = require("axios");
const reactIntl = require("react-intl");
const DataTable = require("react-data-table-component");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const axios__default = /* @__PURE__ */ _interopDefault(axios);
const DataTable__default = /* @__PURE__ */ _interopDefault(DataTable);
const HomePage = () => {
  const { formatMessage } = reactIntl.useIntl();
  const baseUrl = process.env.STRAPI_ADMIN_BACKEND_URL;
  const [dropDownData, setDropDownData] = react.useState([]);
  const [columns, setColumns] = react.useState([]);
  const [tableData, setTableData] = react.useState([]);
  const [selectedValue, setSelectedValue] = react.useState(null);
  const [isLoading, setIsLoading] = react.useState(true);
  const [isSuccessMessage, setIsSuccessMessage] = react.useState(false);
  const [fileName, setFileName] = react.useState("");
  const [loading, setLoading] = react.useState(false);
  const [totalRows, setTotalRows] = react.useState(0);
  const [perPage, setPerPage] = react.useState(10);
  react.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios__default.default.get(
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
      const response = await axios__default.default.get(
        `${baseUrl}/api/export-excel/download-excel`,
        {
          responseType: "arraybuffer",
          params: {
            uid: selectedValue
          }
        }
      );
      if (response.data) {
        const currentDate = /* @__PURE__ */ new Date();
        const formattedDate = formatDate(currentDate);
        setFileName(`file-${formattedDate}.xlsx`);
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `file-${formattedDate}.xlsx`;
        link.click();
        setIsSuccessMessage(true);
        setTimeout(() => {
          setIsSuccessMessage(false);
        }, 8e3);
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
    selector: (row) => row[property]?.toString()
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
        const response = await axios__default.default.get(
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
      const response = await axios__default.default.get(
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
  return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Main, { children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { background: "neutral100", padding: 4, children: [
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", as: "h2", children: "Excel Download" }),
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { padding: 4, width: "600px", marginBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsx(
      designSystem.Combobox,
      {
        label: "Collection Type",
        size: "M",
        onChange: handleComboboxChange,
        value: selectedValue,
        placeholder: "Select collection type",
        onClear: handleComboBoxClear,
        children: dropDownData?.data?.map((item) => /* @__PURE__ */ jsxRuntime.jsx(designSystem.ComboboxOption, { value: item.value, children: item.label }, item.value))
      }
    ) }),
    selectedValue && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { padding: 4, marginTop: 2, children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { size: "L", variant: "default", onClick: handleDownloadExcel, children: "Download" }),
        isSuccessMessage && /* @__PURE__ */ jsxRuntime.jsxs(
          designSystem.Typography,
          {
            style: {
              color: "green",
              fontSize: "medium",
              fontWeight: "500"
            },
            children: [
              "Download completed: ",
              fileName,
              " successfully downloaded!"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { style: { overflowY: "auto", width: "90vw", height: "100vh", padding: "0 16px" }, children: /* @__PURE__ */ jsxRuntime.jsx(
        DataTable__default.default,
        {
          columns: columnRestructure,
          data: tableData,
          pagination: true,
          paginationServer: true,
          paginationTotalRows: totalRows,
          onChangeRowsPerPage: handlePerRowsChange,
          onChangePage: handlePageChange,
          progressPending: loading
        }
      ) })
    ] })
  ] }) });
};
const App = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(reactRouterDom.Routes, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { index: true, element: /* @__PURE__ */ jsxRuntime.jsx(HomePage, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { path: "*", element: /* @__PURE__ */ jsxRuntime.jsx(admin.Page.Error, {}) })
  ] });
};
exports.App = App;
//# sourceMappingURL=App-DY5UAdcx.js.map
