
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Settings as SettingsIcon,
  Palette,
  LayoutDashboard,
  Database,
  Server,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Save,
  Monitor,
  Table2,
  HardDrive,
} from "lucide-react";

import {
  useAppSettings,
  type Preferences,
} from "../context/SettingsContext";

import { BACKEND_URL } from "../services/config";

interface HealthStatus {
  connected: boolean;
  message: string;
  checkedAt: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultPage: "/",
  tableRows: "10",
  layoutDensity: "comfortable",
};

const PAGE_OPTIONS = [
  { label: "Overview", value: "/" },
  { label: "Customers", value: "/customers" },
  { label: "Transactions", value: "/transactions" },
  { label: "Loans", value: "/loans" },
  { label: "Fixed Deposits", value: "/deposits" },
  { label: "Branches", value: "/branches" },
  { label: "Risk Intelligence", value: "/risk" },
];

function Settings() {
  const { preferences, setPreferences } = useAppSettings();

  const [formPreferences, setFormPreferences] =
    useState<Preferences>(preferences);

  const [savedMessage, setSavedMessage] = useState("");
  const [checkingHealth, setCheckingHealth] = useState(false);

  const [health, setHealth] = useState<HealthStatus>({
    connected: false,
    message: "Checking backend connection...",
    checkedAt: "",
  });

  // Keep the form synchronized with application preferences.
  useEffect(() => {
    setFormPreferences(preferences);
  }, [preferences]);

  // Check backend API connectivity.
  const checkBackend = async () => {
    try {
      setCheckingHealth(true);

      const response = await axios.get(`${BACKEND_URL}/api/health`, {
        timeout: 5000,
      });

      const data = response.data || {};

      setHealth({
        connected: true,
        message:
          data.message ||
          data.status ||
          "Backend API is reachable.",
        checkedAt: new Date().toLocaleString("en-IN"),
      });
    } catch (error) {
      console.error("Backend health check failed:", error);

      setHealth({
        connected: false,
        message: "Backend is unavailable. Check the backend server.",
        checkedAt: new Date().toLocaleString("en-IN"),
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // Update an individual preference.
  const updatePreference = (
    key: keyof Preferences,
    value: string
  ) => {
    setFormPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("");
  };

  // Save preferences globally and persist them in the browser.
  const savePreferences = () => {
    try {
      localStorage.setItem(
        "bankvision_preferences",
        JSON.stringify(formPreferences)
      );

      setPreferences(formPreferences);

      setSavedMessage("Your preferences have been saved successfully.");
    } catch (error) {
      console.error("Unable to save preferences:", error);

      setSavedMessage(
        "Unable to save preferences. Check your browser storage."
      );
    }
  };

  // Restore application defaults.
  const resetPreferences = () => {
    try {
      localStorage.setItem(
        "bankvision_preferences",
        JSON.stringify(DEFAULT_PREFERENCES)
      );

      setFormPreferences(DEFAULT_PREFERENCES);
      setPreferences(DEFAULT_PREFERENCES);

      setSavedMessage("Default preferences restored successfully.");
    } catch (error) {
      console.error("Unable to reset preferences:", error);

      setSavedMessage("Unable to reset preferences.");
    }
  };

  const hasUnsavedChanges =
    JSON.stringify(formPreferences) !== JSON.stringify(preferences);

  return (
    <div className="settings-page">

      {/* Page Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your BankVision dashboard preferences and monitor
            system connectivity.
          </p>
        </div>

        <div className="settings-header-icon">
          <SettingsIcon size={23} />
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div className="settings-heading-icon blue">
            <LayoutDashboard size={19} />
          </div>

          <div>
            <h3>Dashboard Preferences</h3>
            <p>Configure how your dashboard should behave.</p>
          </div>
        </div>

        <div className="settings-field">
          <div>
            <label htmlFor="default-page">
              Default Landing Page
            </label>

            <p>
              Select which dashboard page should open when you launch
              BankVision.
            </p>
          </div>

          <select
            id="default-page"
            value={formPreferences.defaultPage}
            onChange={(event) =>
              updatePreference("defaultPage", event.target.value)
            }
          >
            {PAGE_OPTIONS.map((page) => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-field">
          <div>
            <label htmlFor="table-rows">
              Table Rows Per Page
            </label>

            <p>
              Set the preferred number of records displayed in dashboard
              tables.
            </p>
          </div>

          <select
            id="table-rows"
            value={formPreferences.tableRows}
            onChange={(event) =>
              updatePreference("tableRows", event.target.value)
            }
          >
            <option value="10">10 rows</option>
            <option value="25">25 rows</option>
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
          </select>
        </div>

        <div className="settings-preference-note">
          <Monitor size={17} />
          <span>
            Your selected landing page and table preferences are shared
            across the BankVision application.
          </span>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div className="settings-heading-icon purple">
            <Palette size={19} />
          </div>

          <div>
            <h3>Appearance</h3>
            <p>Customize the visual density of your dashboard.</p>
          </div>
        </div>

        <div className="settings-field">
          <div>
            <label htmlFor="layout-density">
              Layout Density
            </label>

            <p>
              Compact uses tighter spacing. Comfortable uses standard
              dashboard spacing.
            </p>
          </div>

          <select
            id="layout-density"
            value={formPreferences.layoutDensity}
            onChange={(event) =>
              updatePreference("layoutDensity", event.target.value)
            }
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <div className="settings-info">
          <AlertCircle size={17} />

          <span>
            Dark mode is not implemented yet. BankVision currently uses
            its existing light theme.
          </span>
        </div>
      </div>

      {/* System Information */}
      <div className="settings-section">

        <div className="settings-section-heading">
          <div className="settings-heading-icon green">
            <Database size={19} />
          </div>

          <div>
            <h3>Data & System Information</h3>
            <p>Monitor the BankVision backend connection.</p>
          </div>
        </div>

        <div className="settings-system-card">

          <div className="settings-system-left">
            <div className="settings-system-icon">
              <Server size={20} />
            </div>

            <div>
              <strong>Backend API</strong>
              <span>{BACKEND_URL}</span>
            </div>
          </div>

          <div
            className={`settings-connection-status ${
              health.connected ? "connected" : "disconnected"
            }`}
          >
            {health.connected ? (
              <CheckCircle size={15} />
            ) : (
              <AlertCircle size={15} />
            )}

            {health.connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        <div className="settings-health-message">
          <span>{health.message}</span>

          {health.checkedAt && (
            <small>Last checked: {health.checkedAt}</small>
          )}
        </div>

        <button
          className="settings-secondary-btn"
          onClick={checkBackend}
          disabled={checkingHealth}
        >
          <RefreshCw
            size={15}
            className={checkingHealth ? "settings-spinning" : ""}
          />

          {checkingHealth ? "Checking..." : "Check Connection"}
        </button>

        <div className="settings-data-info">

          <div>
            <Database size={17} />
            <span>Database</span>
            <strong>MySQL 8.0</strong>
          </div>

          <div>
            <Monitor size={17} />
            <span>Application</span>
            <strong>BankVision</strong>
          </div>

          <div>
            <HardDrive size={17} />
            <span>Data Type</span>
            <strong>Synthetic Demo Data</strong>
          </div>

          <div>
            <Table2 size={17} />
            <span>Frontend</span>
            <strong>React + TypeScript</strong>
          </div>

        </div>
      </div>

      {/* Save and Reset Actions */}
      <div className="settings-actions">

        <div>
          <strong>Save your preferences</strong>

          <p>
            Changes are stored locally in this browser.
          </p>

          {savedMessage && (
            <span className="settings-save-message">
              {savedMessage}
            </span>
          )}

          {hasUnsavedChanges && (
            <span className="settings-unsaved-message">
              You have unsaved changes.
            </span>
          )}
        </div>

        <div className="settings-action-buttons">

          <button
            className="settings-reset-btn"
            onClick={resetPreferences}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            className="settings-save-btn"
            onClick={savePreferences}
            disabled={!hasUnsavedChanges}
          >
            <Save size={15} />
            Save Changes
          </button>

        </div>
      </div>

    </div>
  );
}

export default Settings;
