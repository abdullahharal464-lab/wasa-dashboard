import React, { useState, useMemo } from 'react';
import { 
  Droplet, Gauge, CircleDashed, Receipt, Wrench, 
  Beaker, Plug, Plus, Search, ChevronLeft, LogIn, LogOut, Waves, Users
} from 'lucide-react';

const CATEGORIES = [
  { id: '1', name: 'Sewerage Overflow', icon: Waves },
  { id: '2', name: 'Water Leakage', icon: Droplet },
  { id: '3', name: 'Low Pressure', icon: Gauge },
  { id: '4', name: 'Open Manhole', icon: CircleDashed },
  { id: '5', name: 'Billing Issue', icon: Receipt },
  { id: '6', name: 'Pipe Burst', icon: Wrench },
  { id: '7', name: 'Contaminated Water', icon: Beaker },
  { id: '8', name: 'New Connection', icon: Plug },
];

const INITIAL_COMPLAINTS = [
  { id: 1, category: 'Water Leakage', name: 'Ahmad Khan', phone: '03001234567', location: 'Block A, Street 5, H#12', status: 'Remaining', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
  { id: 2, category: 'Sewerage Overflow', name: 'Sara Ali', phone: '03339876543', location: 'Block C, Main Road', status: 'Resolved', timestamp: new Date(Date.now() - 172800000).toLocaleString() },
];

const LOCATIONS = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G'];
const STATUSES = ['Resolved', 'Remaining', 'Not Related', 'Forwarded'];

export default function App() {
  const [user, setUser] = useState(null); // { username: 'admin', role: 'WASA_Staff' }
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  
  // Navigation State
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'table' | 'login'
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);
  
  const isAuthenticated = user !== null;
  const canEdit = isAuthenticated && user.role === 'WASA_Staff';

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ username: 'Staff User', role: 'WASA_Staff' });
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const dashboardData = useMemo(() => {
    const data = {};
    CATEGORIES.forEach(c => {
      data[c.name] = { Resolved: 0, Remaining: 0, 'Not Related': 0, Forwarded: 0 };
    });
    complaints.forEach(comp => {
      if (data[comp.category] && data[comp.category][comp.status] !== undefined) {
        data[comp.category][comp.status]++;
      }
    });
    return data;
  }, [complaints]);

  if (view === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="flex justify-center mb-4">
            <Droplet size={48} color="var(--wasa-blue)" />
          </div>
          <h2>WASA Staff Portal</h2>
          <p>Satellite Town Division</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Staff ID</label>
              <input type="text" className="form-control" placeholder="Enter ID" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="Enter Password" required />
            </div>
            <button type="submit" className="btn btn-primary login-btn">Login</button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '0.5rem', color: 'var(--text-secondary)', borderColor: '#cbd5e1' }}
              onClick={() => setView('dashboard')}
            >
              Continue as Guest (Read-Only)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-title">
          <Droplet size={28} />
          <h1>WASA Satellite Town - Complaints Dashboard</h1>
        </div>
        <div className="auth-controls">
          {isAuthenticated ? (
            <>
              <span className="auth-badge">
                <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {user.username} (Staff)
              </span>
              <button onClick={handleLogout} className="btn btn-outline" title="Logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <span className="auth-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>Read-Only View</span>
              <button onClick={() => setView('login')} className="btn btn-outline">
                <LogIn size={18} /> Staff Login
              </button>
            </>
          )}
        </div>
      </header>

      <main className="dashboard-container">
        {view === 'dashboard' ? (
          <>
            <div className="dashboard-header">
              <h2>Division Overview</h2>
            </div>
            
            <div className="grid-4x2">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const stats = dashboardData[category.name];
                
                return (
                  <div key={category.id} className="category-card">
                    <div className="card-header">
                      <div className="icon-wrapper">
                        <Icon size={24} />
                      </div>
                      <h3 className="card-title">{category.name}</h3>
                    </div>
                    
                    <div className="status-counters">
                      <div className="counter-item c-resolved">
                        <span className="counter-label">Resolved</span>
                        <span className="counter-value">{stats['Resolved']}</span>
                      </div>
                      <div className="counter-item c-remaining">
                        <span className="counter-label">Remaining</span>
                        <span className="counter-value">{stats['Remaining']}</span>
                      </div>
                      <div className="counter-item c-notrelated">
                        <span className="counter-label">Not Related</span>
                        <span className="counter-value">{stats['Not Related']}</span>
                      </div>
                      <div className="counter-item c-forwarded">
                        <span className="counter-label">Forwarded</span>
                        <span className="counter-value">{stats['Forwarded']}</span>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          setActiveCategory(category.name);
                          setView('table');
                        }}
                      >
                        View Details
                      </button>
                      
                      {canEdit && (
                        <button 
                          className="btn btn-icon-only"
                          onClick={() => {
                            setModalCategory(category.name);
                            setIsModalOpen(true);
                          }}
                          title={`Add New Complaint: ${category.name}`}
                        >
                          <Plus size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <TableView 
            category={activeCategory} 
            complaints={complaints}
            setComplaints={setComplaints}
            onBack={() => setView('dashboard')}
            canEdit={canEdit}
          />
        )}
      </main>

      {isModalOpen && (
        <AddComplaintModal 
          category={modalCategory}
          onClose={() => setIsModalOpen(false)}
          onAdd={(newComplaint) => {
            setComplaints([...complaints, newComplaint]);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function AddComplaintModal({ category, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    block: LOCATIONS[0],
    address: '',
    status: 'Remaining'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.phone.replace(/\D/g, '').length !== 11) {
      alert("Contact number must be 11 digits.");
      return;
    }

    const newComplaint = {
      id: Date.now(),
      category: category,
      name: formData.name,
      phone: formData.phone,
      location: `${formData.block}, ${formData.address}`,
      status: formData.status,
      timestamp: new Date().toLocaleString()
    };
    
    onAdd(newComplaint);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content text-left">
        <div className="modal-header">
          <h3>Add New Complaint - {category}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Complainer Name <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Contact Number (11 Digits) <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="03001234567"
                pattern="[0-9]{11}"
                title="Please enter exactly 11 digits"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="form-row" style={{marginBottom: '1.5rem'}}>
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:500, fontSize:'0.9rem'}}>Block</label>
                <select 
                  className="form-control"
                  value={formData.block}
                  onChange={e => setFormData({...formData, block: e.target.value})}
                >
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:500, fontSize:'0.9rem'}}>Street / House</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group mb-0">
              <label>Initial Status</label>
              <select 
                className="form-control"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" style={{color: 'var(--text-primary)', borderColor: '#cbd5e1'}} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Complaint</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TableView({ category, complaints, setComplaints, onBack, canEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredComplaints = complaints.filter(c => {
    if (c.category !== category) return false;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(lowerTerm) || c.phone.includes(lowerTerm);
    }
    return true;
  });

  const handleStatusChange = (id, newStatus) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const statusToBadgeClass = (status) => {
    return `badge badge-${status.replace(/\s+/g, '').toLowerCase()}`;
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={20} /> Back to Dashboard
      </button>
      
      <div className="dashboard-header" style={{marginBottom: '1rem'}}>
        <h2>{category} Complaints</h2>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <div className="search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
            Total Records: <strong>{filteredComplaints.length}</strong>
          </div>
        </div>
        
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
                <th>Timestamp</th>
                {canEdit && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map(c => (
                  <tr key={c.id}>
                    <td style={{color: 'var(--text-secondary)', fontSize: '0.8rem'}}>#{c.id.toString().slice(-6)}</td>
                    <td style={{fontWeight: 500}}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.location}</td>
                    <td>
                      <span className={statusToBadgeClass(c.status)}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{c.timestamp}</td>
                    {canEdit && (
                      <td>
                        <select 
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className="form-control"
                          style={{padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '120px'}}
                        >
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
