'use client';
import React, { useState } from 'react';
import styles from './settings.module.css';
import {
  IconSettings,
  IconShieldLock,
  IconBell,
  IconPalette,
  IconCheck,
  IconChevronDown,
  IconLock,
  IconShieldCheck,
  IconWorld,
  IconClock,
  IconDeviceFloppy
} from '@tabler/icons-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');
  const [saved, setSaved] = useState(false);

  // Preference states
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [units, setUnits] = useState('metric');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [twoFactor, setTwoFactor] = useState(true);
  const [themeMode, setThemeMode] = useState('dark');
  const [fontScale, setFontScale] = useState('standard');

  const tabs = [
    { id: 'General', label: 'General', icon: IconSettings },
    { id: 'Security', label: 'Security & Auth', icon: IconShieldLock },
    { id: 'Notifications', label: 'Notifications', icon: IconBell },
    { id: 'Appearance', label: 'Appearance', icon: IconPalette },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={styles.container}>
      {/* High-contrast Medical Banner */}
      <div className={styles.headerBanner}>
        <h1 className={styles.headerTitle}>
          <IconSettings size={28} color="#38bdf8" />
          Account Settings
        </h1>
        <p className={styles.headerSubtitle}>
          Configure your clinical workspace, notification alerts, and security preferences.
        </p>
      </div>

      <div className={styles.settingsContent}>
        {/* Left Navigation Rail / Card */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                  aria-selected={isActive}
                >
                  <Icon
                    size={20}
                    className={isActive ? styles.tabIconActive : styles.tabIconInactive}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Preference Card */}
        <div className={styles.mainPanel}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>
                  {activeTab === 'General' && <IconWorld size={18} />}
                  {activeTab === 'Security' && <IconShieldLock size={18} />}
                  {activeTab === 'Notifications' && <IconBell size={18} />}
                  {activeTab === 'Appearance' && <IconPalette size={18} />}
                  {activeTab} Preferences
                </h2>
                <p className={styles.cardSubtitle}>
                  {activeTab === 'General' && 'System language, regional formats, and measurement standards.'}
                  {activeTab === 'Security' && 'Protect your clinical access and electronic health records.'}
                  {activeTab === 'Notifications' && 'Manage your appointment reminders and critical diagnostic alerts.'}
                  {activeTab === 'Appearance' && 'Interface visual contrast, color theme, and typography scales.'}
                </p>
              </div>
            </div>

            <div className={styles.preferencesList}>
              {/* --- GENERAL TAB --- */}
              {activeTab === 'General' && (
                <>
                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Interface Language</h4>
                      <p className={styles.preferenceDesc}>
                        Select your preferred language for clinical forms, prescriptions, and navigation.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        aria-label="Interface Language"
                      >
                        <option value="en">English (US)</option>
                        <option value="en-gb">English (UK)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="fr">French (Français)</option>
                        <option value="de">German (Deutsch)</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Date & Time Format</h4>
                      <p className={styles.preferenceDesc}>
                        Used in consultation timestamps, appointment scheduling, and patient history logs.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        aria-label="Date and Time Format"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (24 Hours)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12 Hours AM/PM)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Clinical Measurement Units</h4>
                      <p className={styles.preferenceDesc}>
                        Standard units for patient vitals, body temperature, height, and weight metrics.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        aria-label="Measurement Units"
                      >
                        <option value="metric">Metric (kg, cm, °C, mmHg)</option>
                        <option value="imperial">Imperial (lbs, ft/in, °F, mmHg)</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === 'Notifications' && (
                <>
                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Email Summaries & Daily Schedule</h4>
                      <p className={styles.preferenceDesc}>
                        Receive daily morning digest of scheduled consultations and upcoming surgical reviews.
                      </p>
                    </div>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox"
                        className={styles.switchInput}
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                      <span className={styles.switchSlider}></span>
                    </label>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Critical Diagnostic SMS Alerts</h4>
                      <p className={styles.preferenceDesc}>
                        Instant mobile notifications when high-risk radiological findings (e.g. STEMI, Acute Fracture) are uploaded.
                      </p>
                    </div>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox"
                        className={styles.switchInput}
                        checked={criticalSms}
                        onChange={(e) => setCriticalSms(e.target.checked)}
                      />
                      <span className={styles.switchSlider}></span>
                    </label>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Consultation Audio Chimes</h4>
                      <p className={styles.preferenceDesc}>
                        Play an audible chime when a connected patient enters the live consultation queue.
                      </p>
                    </div>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox"
                        className={styles.switchInput}
                        checked={soundAlerts}
                        onChange={(e) => setSoundAlerts(e.target.checked)}
                      />
                      <span className={styles.switchSlider}></span>
                    </label>
                  </div>
                </>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === 'Security' && (
                <>
                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Account Password</h4>
                      <p className={styles.preferenceDesc}>
                        Last updated 42 days ago. Strong encryption enforced.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => alert('A secure password reset link has been dispatched to your verified clinical email address.')}
                    >
                      <IconLock size={16} />
                      Change Password
                    </button>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Two-Factor Authentication (2FA)</h4>
                      <p className={styles.preferenceDesc}>
                        Requires TOTP code verification on login for enhanced HIPAA &amp; EHR security compliance.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={styles.securityBadge}>
                        <IconShieldCheck size={14} />
                        Active &amp; Verified
                      </span>
                      <label className={styles.switchLabel}>
                        <input
                          type="checkbox"
                          className={styles.switchInput}
                          checked={twoFactor}
                          onChange={(e) => setTwoFactor(e.target.checked)}
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Idle Session Inactivity Timeout</h4>
                      <p className={styles.preferenceDesc}>
                        Automatically lock workspace to protect confidential patient records when unattended.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        aria-label="Session Inactivity Timeout"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes (Recommended)</option>
                        <option value="60">60 Minutes</option>
                        <option value="never">Never (Not Recommended)</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- APPEARANCE TAB --- */}
              {activeTab === 'Appearance' && (
                <>
                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Interface Color Theme</h4>
                      <p className={styles.preferenceDesc}>
                        High-contrast Slate Blue theme engineered for optimal diagnostic image clarity and reduced eye strain.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                        aria-label="Color Theme"
                      >
                        <option value="dark">Clinical Dark Mode (High Contrast)</option>
                        <option value="slate">Slate Monochrome Medical</option>
                        <option value="light">Clinical Light Mode</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.preferenceRow}>
                    <div className={styles.preferenceInfo}>
                      <h4 className={styles.preferenceTitle}>Clinical Typography Scale</h4>
                      <p className={styles.preferenceDesc}>
                        Adjust system font sizing for improved readability on high-DPI diagnostic monitors.
                      </p>
                    </div>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.selectInput}
                        value={fontScale}
                        onChange={(e) => setFontScale(e.target.value)}
                        aria-label="Typography Scale"
                      >
                        <option value="standard">Standard (100%)</option>
                        <option value="medium">Enhanced (110%)</option>
                        <option value="large">Large Accessibility (125%)</option>
                      </select>
                      <div className={styles.selectArrow}>
                        <IconChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* High-Contrast Bottom Actions Area */}
            <div className={styles.footerArea}>
              {saved && (
                <div className={styles.statusToast}>
                  <IconCheck size={18} />
                  <span>Preferences updated successfully!</span>
                </div>
              )}
              <button
                type="button"
                className={`${styles.saveButton} ${saved ? styles.savedSuccess : ''}`}
                onClick={handleSave}
              >
                {saved ? (
                  <>
                    <IconCheck size={18} />
                    Saved!
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
