import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Search, Plus, Edit, Trash2, Bell, Moon, Sun, Download, User, LogOut, Calendar, DollarSign, TrendingUp, Filter } from 'lucide-react';

// Context for managing global state
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Mock authentication context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Authentication Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('subscription_tracker_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - in real app, this would be an API call
    const mockUser = { id: 1, email, name: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('subscription_tracker_user', JSON.stringify(mockUser));
    return Promise.resolve(mockUser);
  };

  const register = (email, password, name) => {
    // Mock registration
    const mockUser = { id: 1, email, name };
    setUser(mockUser);
    localStorage.setItem('subscription_tracker_user', JSON.stringify(mockUser));
    return Promise.resolve(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('subscription_tracker_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// App State Provider
const AppProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSubscriptions = localStorage.getItem('subscriptions');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    } else {
      // Add some sample data for demo
      const sampleData = [
        {
          id: 1,
          name: 'Netflix',
          amount: 15.99,
          frequency: 'monthly',
          nextPayment: '2025-07-15',
          category: 'Entertainment',
          description: 'Video streaming service'
        },
        {
          id: 2,
          name: 'Spotify',
          amount: 9.99,
          frequency: 'monthly',
          nextPayment: '2025-07-10',
          category: 'Entertainment',
          description: 'Music streaming'
        },
        {
          id: 3,
          name: 'Adobe Creative Cloud',
          amount: 239.88,
          frequency: 'yearly',
          nextPayment: '2025-12-01',
          category: 'Software',
          description: 'Design software suite'
        }
      ];
      setSubscriptions(sampleData);
      localStorage.setItem('subscriptions', JSON.stringify(sampleData));
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save to localStorage whenever subscriptions change
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const addSubscription = (subscription) => {
    const newSubscription = {
      ...subscription,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setSubscriptions(prev => [...prev, newSubscription]);
  };

  const updateSubscription = (id, updatedSubscription) => {
    setSubscriptions(prev => 
      prev.map(sub => sub.id === id ? { ...sub, ...updatedSubscription } : sub)
    );
  };

  const deleteSubscription = (id) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || sub.category === filterCategory;
    const matchesFrequency = !filterFrequency || sub.frequency === filterFrequency;
    
    return matchesSearch && matchesCategory && matchesFrequency;
  });

  return (
    <AppContext.Provider value={{
      subscriptions,
      filteredSubscriptions,
      searchTerm,
      setSearchTerm,
      filterCategory,
      setFilterCategory,
      filterFrequency,
      setFilterFrequency,
      darkMode,
      setDarkMode,
      showAddModal,
      setShowAddModal,
      editingSubscription,
      setEditingSubscription,
      addSubscription,
      updateSubscription,
      deleteSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Login Component
const LoginForm = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Tracker</h1>
          <p className="text-gray-600">Manage your recurring expenses</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Subscription Form Modal
const SubscriptionModal = () => {
  const { 
    showAddModal, 
    setShowAddModal, 
    editingSubscription, 
    setEditingSubscription,
    addSubscription,
    updateSubscription,
    darkMode
  } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    nextPayment: '',
    category: '',
    description: ''
  });

  const isEditing = !!editingSubscription;
  const isOpen = showAddModal || isEditing;

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name || '',
        amount: editingSubscription.amount || '',
        frequency: editingSubscription.frequency || 'monthly',
        nextPayment: editingSubscription.nextPayment || '',
        category: editingSubscription.category || '',
        description: editingSubscription.description || ''
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        frequency: 'monthly',
        nextPayment: '',
        category: '',
        description: ''
      });
    }
  }, [editingSubscription]);

  const handleClose = () => {
    setShowAddModal(false);
    setEditingSubscription(null);
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      nextPayment: '',
      category: '',
      description: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subscriptionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (isEditing) {
      updateSubscription(editingSubscription.id, subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }
    
    handleClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div 
        className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Billing Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Next Payment Date</label>
            <input
              type="date"
              name="nextPayment"
              value={formData.nextPayment}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Category</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Software">Software</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 ${
                darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Update' : 'Add'} Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { subscriptions, darkMode } = useAppContext();

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      switch (sub.frequency) {
        case 'weekly':
          return total + (sub.amount * 4.33);
        case 'monthly':
          return total + sub.amount;
        case 'quarterly':
          return total + (sub.amount / 3);
        case 'yearly':
          return total + (sub.amount / 12);
        default:
          return total;
      }
    }, 0);
  };

  const calculateYearlyTotal = () => {
    return calculateMonthlyTotal() * 12;
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return subscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPayment);
      return paymentDate <= nextWeek && paymentDate >= today;
    });
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    subscriptions.forEach(sub => {
      const monthlyAmount = (() => {
        switch (sub.frequency) {
          case 'weekly': return sub.amount * 4.33;
          case 'monthly': return sub.amount;
          case 'quarterly': return sub.amount / 3;
          case 'yearly': return sub.amount / 12;
          default: return 0;
        }
      })();
      
      categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyAmount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const upcomingPayments = getUpcomingPayments();
  const categoryData = getCategoryData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold">${calculateMonthlyTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yearly Total</p>
              <p className="text-2xl font-bold">${calculateYearlyTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Payments</p>
              <p className="text-2xl font-bold">{upcomingPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Monthly Expenses */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <h3 className="text-lg font-semibold mb-4">Monthly Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
          <h3 className="text-lg font-semibold mb-4">Upcoming Payments (Next 7 Days)</h3>
          <div className="space-y-3">
            {upcomingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium">{payment.name}</p>
                  <p className="text-sm text-gray-600">{payment.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${payment.amount}</p>
                  <p className="text-sm text-gray-600">{new Date(payment.nextPayment).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subscription List Component
const SubscriptionList = () => {
  const { 
    filteredSubscriptions, 
    searchTerm, 
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterFrequency,
    setFilterFrequency,
    setEditingSubscription,
    deleteSubscription,
    darkMode
  } = useAppContext();

  const categories = ['Entertainment', 'Software', 'Health', 'Education', 'Business', 'Other'];
  const frequencies = ['weekly', 'monthly', 'quarterly', 'yearly'];

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  const getNextPaymentStatus = (date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-yellow-600' };
    return { text: `${diffDays} days`, color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
              }`}
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
            }`}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
            }`}
          >
            <option value="">All Frequencies</option>
            {frequencies.map(freq => (
              <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
              setFilterFrequency('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.map(subscription => {
          const paymentStatus = getNextPaymentStatus(subscription.nextPayment);
          return (
            <div key={subscription.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.name}</h3>
                  <p className="text-sm text-gray-600">{subscription.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSubscription(subscription)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">${subscription.amount}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {subscription.frequency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next payment:</span>
                  <span className={`text-sm font-medium ${paymentStatus.color}`}>
                    {new Date(subscription.nextPayment).toLocaleDateString()} ({paymentStatus.text})
                  </span>
                </div>
                
                {subscription.description && (
                  <p className="text-sm text-gray-600 mt-2">{subscription.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-12 text-center shadow-sm border`}>
          <p className="text-gray-500 text-lg">No subscriptions found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || filterCategory || filterFrequency 
              ? 'Try adjusting your search or filters' 
              : 'Add your first subscription to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Export functionality
const ExportData = () => {
  const { subscriptions } = useAppContext();

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Frequency', 'Next Payment', 'Category', 'Description'];
    const csvData = subscriptions.map(sub => [
      sub.name,
      sub.amount,
      sub.frequency,
      sub.nextPayment,
      sub.category,
      sub.description || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF-like export using HTML
    const content = `
      <html>
        <head>
          <title>Subscription Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Subscription Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Subscriptions: ${subscriptions.length}</p>
            <p>Monthly Total: ${subscriptions.reduce((total, sub) => {
              switch (sub.frequency) {
                case 'weekly': return total + (sub.amount * 4.33);
                case 'monthly': return total + sub.amount;
                case 'quarterly': return total + (sub.amount / 3);
                case 'yearly': return total + (sub.amount / 12);
                default: return total;
              }
            }, 0).toFixed(2)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Next Payment</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptions.map(sub => `
                <tr>
                  <td>${sub.name}</td>
                  <td>${sub.amount}</td>
                  <td>${sub.frequency}</td>
                  <td>${new Date(sub.nextPayment).toLocaleDateString()}</td>
                  <td>${sub.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions-report.html';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return { exportToCSV, exportToPDF };
};

// Main App Component
const AppContent = () => {
  const { user, logout } = useAuth();
  const { 
    darkMode, 
    setDarkMode, 
    setShowAddModal 
  } = useAppContext();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const { exportToCSV, exportToPDF } = ExportData();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
    { id: 'subscriptions', name: 'Subscriptions', icon: Calendar },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Subscription Tracker</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subscription
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Toggle theme"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                
                <div className="flex items-center gap-2 ml-4">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.name || user?.email}</span>
                  <button
                    onClick={logout}
                    className="p-1 hover:bg-gray-100 rounded-md ml-2"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex space-x-4 mb-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'subscriptions' && <SubscriptionList />}
      </div>

      {/* Modal */}
      <SubscriptionModal />
    </div>
  );
};

// Main App with Providers
const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

// Root Component
export default function SubscriptionTracker() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}