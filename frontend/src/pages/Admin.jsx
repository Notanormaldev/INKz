import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications') // 'users' | 'applications' | 'unlimited'
  const [approving, setApproving] = useState(null)

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/admin/stats', { credentials: 'include' })
      if (!res.ok) {
        // Non-admin or unauthenticated -> redirect to Home
        navigate('/')
        return
      }
      const resData = await res.json()
      setData(resData)
    } catch {
      // On network error or failed auth -> redirect to Home
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const handleApprove = async (appId, applicantEmail) => {
    setApproving(appId)
    try {
      const res = await fetch('/api/auth/admin/approve-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ applicationId: appId, email: applicantEmail })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Approval failed')
      }
      await fetchAdminStats()
    } catch (err) {
      alert(err.message)
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Loading Admin Dashboard...</p>
      </div>
    )
  }

  if (!data) return null

  const { admin, totalUsersCount, users, applicationsCount, applications, unlimitedUsersCount, unlimitedUsers } = data

  return (
    <div className="admin-root">
      <div className="admin-bg-grid" />
      <div className="admin-bg-glow" />

      {/* Top Bar Navigation */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <button className="admin-nav-back" onClick={() => navigate('/')}>
              &larr; Back to Home
            </button>
            <div className="admin-title-text">
              Admin Control Panel
            </div>
          </div>

          <div className="admin-profile-badge">
            <img
              src={admin.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${admin.email}`}
              alt={admin.name}
              className="admin-avatar"
            />
            <div className="admin-user-info">
              <span className="admin-name">
                {admin.name} <span className="role-tag">ADMIN</span>
              </span>
              <span className="admin-email">{admin.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-container">
        {/* Stat Cards Grid */}
        <div className="admin-stats-grid">
          <div
            className={`admin-stat-card ${activeTab === 'users' ? 'active-stat' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <div className="stat-card-data">
              <span className="stat-card-num">{totalUsersCount}</span>
              <span className="stat-card-label">Total Users</span>
            </div>
          </div>

          <div
            className={`admin-stat-card ${activeTab === 'applications' ? 'active-stat' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <div className="stat-card-data">
              <span className="stat-card-num">{applicationsCount}</span>
              <span className="stat-card-label">Free Plan Applications</span>
            </div>
          </div>

          <div
            className={`admin-stat-card ${activeTab === 'unlimited' ? 'active-stat' : ''}`}
            onClick={() => setActiveTab('unlimited')}
          >
            <div className="stat-card-data">
              <span className="stat-card-num">{unlimitedUsersCount}</span>
              <span className="stat-card-label">Unlimited Plan Users</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications ({applicationsCount})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'unlimited' ? 'active' : ''}`}
            onClick={() => setActiveTab('unlimited')}
          >
            Unlimited Users ({unlimitedUsersCount})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Registered Users ({totalUsersCount})
          </button>
        </div>

        {/* TAB 1: Early Access Applications */}
        {activeTab === 'applications' && (
          <section className="admin-tab-content">
            <h3 className="section-title">Free Plan Early Access Applications</h3>
            {applications.length === 0 ? (
              <div className="admin-empty-state">
                No applications submitted yet.
              </div>
            ) : (
              <div className="admin-card-list">
                {applications.map((app) => (
                  <div key={app._id} className="app-item-card">
                    <div className="app-item-head">
                      <div className="app-user-meta">
                        <span className="app-applicant-name">{app.name}</span>
                        <span className="app-applicant-email">{app.email}</span>
                      </div>
                      <span className={`status-pill status-${app.status}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="app-item-body">
                      {app.github && (
                        <p className="app-meta-line">
                          <strong>GitHub:</strong>{' '}
                          <a href={app.github} target="_blank" rel="noopener noreferrer">
                            {app.github}
                          </a>
                        </p>
                      )}
                      {app.experience && (
                        <p className="app-meta-line">
                          <strong>Experience:</strong> {app.experience} years
                        </p>
                      )}
                      <p className="app-usecase">
                        <strong>Use Case:</strong> "{app.usecase}"
                      </p>
                      <span className="app-date">Submitted: {new Date(app.createdAt).toLocaleString()}</span>
                    </div>

                    {app.status !== 'approved' && (
                      <div className="app-item-actions">
                        <button
                          className="approve-btn"
                          disabled={approving === app._id}
                          onClick={() => handleApprove(app._id, app.email)}
                        >
                          {approving === app._id ? 'Approving...' : 'Approve & Grant Unlimited Plan'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Unlimited Plan Users */}
        {activeTab === 'unlimited' && (
          <section className="admin-tab-content">
            <h3 className="section-title">Users on Unlimited Cloud Plan</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {unlimitedUsers.map((u) => {
                    const isSelfAdmin = u.email.toLowerCase().trim() === admin.email.toLowerCase().trim()
                    return (
                      <tr key={u._id} className={isSelfAdmin ? 'admin-row' : ''}>
                        <td className="user-cell">
                          <img
                            src={u.avatar || u.profile_pic || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt={u.name}
                            className="table-avatar"
                          />
                          <span className="user-name-text">
                            {u.name} {isSelfAdmin && <span className="owner-tag">PRIMARY ADMIN</span>}
                          </span>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>{u.role || (isSelfAdmin ? 'admin' : 'user')}</span>
                        </td>
                        <td>
                          <span className="plan-badge unlimited">UNLIMITED</span>
                        </td>
                        <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: All Registered Users */}
        {activeTab === 'users' && (
          <section className="admin-tab-content">
            <h3 className="section-title">All Registered Users ({totalUsersCount})</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelfAdmin = u.email.toLowerCase().trim() === admin.email.toLowerCase().trim()
                    return (
                      <tr key={u._id} className={isSelfAdmin ? 'admin-row' : ''}>
                        <td className="user-cell">
                          <img
                            src={u.avatar || u.profile_pic || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`}
                            alt={u.name}
                            className="table-avatar"
                          />
                          <span className="user-name-text">
                            {u.name} {isSelfAdmin && <span className="owner-tag">ADMIN</span>}
                          </span>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>{u.role || (isSelfAdmin ? 'admin' : 'user')}</span>
                        </td>
                        <td>
                          <span className={`plan-badge ${u.plan || (isSelfAdmin ? 'unlimited' : 'free')}`}>
                            {u.plan === 'unlimited' || isSelfAdmin ? 'UNLIMITED' : 'FREE'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
