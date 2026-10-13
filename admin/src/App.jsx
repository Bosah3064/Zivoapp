import React, { useState, useEffect } from 'react';
import { adminService } from './lib/firebase';
import { 
  Users, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  Coins, 
  TrendingUp,
  Save,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Edit2,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const usersData = await adminService.getUsers();
    const reportsData = await adminService.getReports();
    const settingsData = await adminService.getSettings();

    setUsers(usersData);
    setReports(reportsData);
    setSettings(settingsData);
    setLoading(false);
  };

  const updateCoins = async (userId, delta) => {
    const updated = await adminService.updateUserCoins(userId, delta);
    setUsers([...updated]);
  };

  const handleDismissReport = async (reportId) => {
    const updated = await adminService.dismissReport(reportId);
    setReports([...updated]);
  };

  const handleBanUser = async (userId, reportId) => {
    if (confirm('Are you sure you want to ban this user?')) {
      const updated = await adminService.banUser(userId);
      setUsers([...updated]);
      if (reportId) {
        handleDismissReport(reportId);
      }
    }
  };

  const startEditSetting = (setting) => {
    setEditingSetting(setting.key);
    setEditValue(JSON.stringify(setting.value, null, 2));
  };

  const saveSetting = async (key) => {
    try {
      const parsed = JSON.parse(editValue);
      const updated = await adminService.updateSetting(key, parsed);
      setSettings([...updated]);
      setEditingSetting(null);
    } catch (e) {
      alert('Invalid JSON format: ' + e.message);
    }
  };

  const renderSidebar = () => (
    <nav className="sidebar">
      <div className="logo-wrap">
        <Sparkles color="#818CF8" size={24} />
        <h1 className="logo">Zivo Admin</h1>
      </div>
      <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
        <TrendingUp size={19} /> Overview
      </button>
      <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>
        <Users size={19} /> User Control
      </button>
      <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'active' : ''}>
        <ShieldAlert size={19} /> Safety Reports ({reports.length})
      </button>
      <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>
        <SettingsIcon size={19} /> Platform Config
      </button>
    </nav>
  );

  if (loading) {
    return <div className="loader">Loading Zivo Management Console...</div>;
  }

  const totalCoins = users.reduce((acc, u) => acc + (u.coins || 0), 0);

  return (
    <div className="admin-container">
      {renderSidebar()}
      
      <main className="content">
        {activeTab === 'dashboard' && (
          <>
            <header className="content-header">
              <h2>Platform Analytics & Health</h2>
              <p className="subtitle">Real-time overview of users, coin circulation, and moderation.</p>
            </header>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-circle user-icon"><Users color="#6366F1" size={24} /></div>
                <h3>Active Members</h3>
                <p className="stat-val">{users.length}</p>
                <span className="stat-badge success">+12% this week</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon-circle coin-icon"><Coins color="#F59E0B" size={24} /></div>
                <h3>Economy Coins Pool</h3>
                <p className="stat-val">{totalCoins.toLocaleString()}</p>
                <span className="stat-badge info">Circulating balance</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon-circle alert-icon"><ShieldAlert color="#EF4444" size={24} /></div>
                <h3>Pending Reports</h3>
                <p className="stat-val">{reports.length}</p>
                <span className={`stat-badge ${reports.length > 0 ? 'warning' : 'success'}`}>
                  {reports.length > 0 ? 'Requires attention' : 'All clear'}
                </span>
              </div>
            </div>

            <div className="section-card">
              <h3>Recent User Registrations</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Intent</th>
                    <th>Coins</th>
                    <th>Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong className="user-name">{u.full_name}</strong>
                        <span className="user-email">{u.email || u.id}</span>
                      </td>
                      <td><span className="tag-pill">{u.intent}</span></td>
                      <td><span className="coin-text">{u.coins} 🪙</span></td>
                      <td className="date-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <header className="content-header">
              <h2>User Control Center</h2>
              <p className="subtitle">Manage user balances, status, and permissions.</p>
            </header>
            
            <div className="section-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Gender</th>
                    <th>Intent</th>
                    <th>Coin Balance</th>
                    <th>Adjust Coins</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong className="user-name">{u.full_name}</strong>
                        <span className="user-id">ID: {u.id}</span>
                      </td>
                      <td>{u.gender || 'Not specified'}</td>
                      <td><span className="tag-pill">{u.intent || 'dating'}</span></td>
                      <td><strong className="coin-val">{u.coins} 🪙</strong></td>
                      <td>
                        <div className="actions">
                          <button onClick={() => updateCoins(u.id, 50)} className="btn-icon plus" title="Add 50 coins">
                            <Plus size={16}/> 50
                          </button>
                          <button onClick={() => updateCoins(u.id, -50)} className="btn-icon minus" title="Deduct 50 coins">
                            <Minus size={16}/> 50
                          </button>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleBanUser(u.id)} className="btn-ban">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <header className="content-header">
              <h2>Safety & Moderation Queue</h2>
              <p className="subtitle">Review reported users and take moderation actions.</p>
            </header>

            <div className="reports-grid">
              {reports.length === 0 ? (
                <div className="empty-reports">
                  <CheckCircle color="#10B981" size={48} />
                  <h3>No Pending Reports!</h3>
                  <p>All user flags have been reviewed. The community is safe.</p>
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="report-card">
                    <div className="report-header">
                      <span className="reporter">Reporter: {r.reporter_name || r.reporter_id}</span>
                      <span className="reported">Target: {r.reported_name || r.reported_id}</span>
                    </div>
                    <div className="report-body">
                      <p><strong>Flag Reason:</strong> {r.reason}</p>
                      <p className="details">{r.details}</p>
                      <span className="report-time">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div className="report-actions">
                      <button onClick={() => handleBanUser(r.reported_id, r.id)} className="btn block">
                        <XCircle size={17}/> Ban User
                      </button>
                      <button onClick={() => handleDismissReport(r.id)} className="btn ignore">
                        <CheckCircle size={17}/> Dismiss Flag
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <header className="content-header">
              <h2>Platform Configuration</h2>
              <p className="subtitle">Global pricing, rewards, and call billing rates.</p>
            </header>

            <div className="settings-container">
              {settings.map(s => (
                <div key={s.key} className="setting-card">
                  <div className="setting-info">
                    <h4>{s.key.replace(/_/g, ' ').toUpperCase()}</h4>
                    {editingSetting === s.key ? (
                      <textarea 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        className="setting-edit"
                      />
                    ) : (
                      <pre className="setting-code">{JSON.stringify(s.value, null, 2)}</pre>
                    )}
                  </div>
                  <div className="setting-actions">
                    {editingSetting === s.key ? (
                      <button onClick={() => saveSetting(s.key)} className="btn save">
                        <Save size={16}/> Save
                      </button>
                    ) : (
                      <button onClick={() => startEditSetting(s)} className="btn edit">
                        <Edit2 size={16}/> Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-container { display: flex; height: 100vh; background: #0B0E14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC; }
        .sidebar { width: 280px; background: #131825; color: #fff; padding: 28px 20px; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; }
        .logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; padding-left: 6px; }
        .logo { font-size: 22px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.5px; }
        .sidebar button { width: 100%; padding: 13px 16px; background: none; border: none; color: #94A3B8; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 14px; font-size: 15px; font-weight: 600; border-radius: 12px; margin-bottom: 6px; transition: all 0.2s; }
        .sidebar button:hover { background: rgba(139, 92, 246, 0.12); color: #F8FAFC; }
        .sidebar button.active { background: #8B5CF6; color: #FFFFFF; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35); }
        
        .content { flex: 1; padding: 36px 40px; overflow-y: auto; background: #0B0E14; }
        .content-header { margin-bottom: 32px; }
        .content-header h2 { font-size: 26px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.5px; }
        .content-header .subtitle { font-size: 14px; color: #94A3B8; margin-top: 6px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
        .stat-card { background: #171D2B; padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .stat-icon-circle { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .user-icon { background: rgba(99, 102, 241, 0.15); }
        .coin-icon { background: rgba(245, 158, 11, 0.15); }
        .alert-icon { background: rgba(239, 68, 68, 0.15); }
        .stat-card h3 { font-size: 13px; color: #94A3B8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .stat-val { font-size: 32px; font-weight: 800; color: #FFFFFF; margin: 6px 0 10px; }
        .stat-badge { font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; display: inline-block; }
        .stat-badge.success { background: rgba(16, 185, 129, 0.15); color: #10B981; }
        .stat-badge.info { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
        .stat-badge.warning { background: rgba(239, 68, 68, 0.15); color: #EF4444; }

        .section-card { background: #171D2B; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .section-card h3 { font-size: 17px; font-weight: 700; color: #FFFFFF; margin-bottom: 18px; }

        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #131825; padding: 14px 16px; font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .admin-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; color: #CBD5E1; }
        .user-name { color: #FFFFFF; font-size: 15px; display: block; }
        .user-email, .user-id { color: #64748B; font-size: 12px; display: block; margin-top: 2px; }
        .tag-pill { background: rgba(139, 92, 246, 0.18); color: #A78BFA; padding: 4px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
        .coin-val, .coin-text { color: #F59E0B; font-weight: 700; font-size: 15px; }

        .actions { display: flex; gap: 8px; }
        .btn-icon { padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 12px; transition: opacity 0.2s; }
        .btn-icon:hover { opacity: 0.85; }
        .plus { background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
        .minus { background: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .btn-ban { padding: 6px 14px; background: rgba(239, 68, 68, 0.12); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 12px; }
        .btn-ban:hover { background: #EF4444; color: #FFFFFF; }

        .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .empty-reports { grid-column: span 2; background: #171D2B; padding: 60px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.08); }
        .empty-reports h3 { color: #FFFFFF; margin-top: 14px; }
        .empty-reports p { color: #94A3B8; margin-top: 6px; }

        .report-card { background: #171D2B; padding: 22px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid #EF4444; }
        .report-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700; color: #818CF8; font-size: 13px; }
        .report-body p { margin-bottom: 6px; color: #CBD5E1; font-size: 14px; }
        .report-body strong { color: #FFFFFF; }
        .report-body .details { color: #94A3B8; font-size: 13px; margin: 8px 0 12px; line-height: 1.5; }
        .report-time { color: #64748B; font-size: 11px; display: block; margin-bottom: 16px; }
        .report-actions { display: flex; gap: 10px; }
        .btn { padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; }
        .block { background: #EF4444; color: #fff; }
        .ignore { background: #1F273A; color: #94A3B8; border: 1px solid rgba(255,255,255,0.08); }
        .ignore:hover { color: #FFFFFF; }

        .settings-container { display: flex; flex-direction: column; gap: 16px; }
        .setting-card { background: #171D2B; padding: 22px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.08); }
        .setting-info { flex: 1; margin-right: 20px; }
        .setting-info h4 { margin-bottom: 10px; color: #818CF8; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; }
        .setting-code { background: #0B0E14; padding: 12px; border-radius: 10px; color: #F8FAFC; font-family: monospace; font-size: 13px; border: 1px solid rgba(255,255,255,0.06); }
        .setting-edit { width: 100%; min-height: 90px; padding: 10px; border-radius: 10px; background: #0B0E14; border: 1px solid #8B5CF6; color: #FFFFFF; font-family: monospace; font-size: 13px; }
        .save { background: #8B5CF6; color: #fff; }
        .edit { background: #1F273A; color: #A78BFA; border: 1px solid rgba(139, 92, 246, 0.3); }

        .loader { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #8B5CF6; font-weight: 700; background: #0B0E14; }
      `}</style>
    </div>
  );
}
