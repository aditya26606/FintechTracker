import React, { useState, useEffect } from 'react';
import apiRequest, { BACKEND_URL } from '../api';
import { useAuth } from '../context/AuthContext';

import { useToast } from '../context/ToastContext';
import VoiceInput from '../components/VoiceInput';
import Tesseract from 'tesseract.js';
import { CATEGORIES_CONFIG } from '../components/CategoryConfig';
import CategorySelector from '../components/CategorySelector';
import CategoryPillFilter from '../components/CategoryPillFilter';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  FileText, 
  Filter, 
  Loader,
  Image,
  X,
  FileSpreadsheet
} from 'lucide-react';

const ExpenseTracker = () => {
  const { user } = useAuth();
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const currencySymbol = currencySymbols[user?.preferences?.currency] || '₹';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const toast = useToast();

  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(user?.preferences?.defaultExpenseCategory || '');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  
  const [receiptPreview, setReceiptPreview] = useState('');
  const [activePreviewUrl, setActivePreviewUrl] = useState('');

  
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Others'];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);
      if (searchFilter) params.append('search', searchFilter);

      const endpoint = `/expenses?${params.toString()}`;
      const data = await apiRequest(endpoint);
      setExpenses(data);
    } catch (error) {
      toast.showToast('Error loading expenses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, startDateFilter, endDateFilter, searchFilter]);

  const resetForm = () => {
    setEditingExpense(null);
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setCategory(user?.preferences?.defaultExpenseCategory || '');
    setDescription('');
    setReceiptFile(null);
    setReceiptPreview('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description || '');
    setReceiptPreview(expense.receiptFile ? `${BACKEND_URL}${expense.receiptFile}` : '');
    setReceiptFile(null);
    setShowFormModal(true);
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      
      
      handleOCR(file);
    }
  };

  
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      handleOCR(file);
    }
  };

  
  const handleVoiceParsed = ({ amount, category, description }) => {
    setAmount(amount.toString());
    setCategory(category);
    setDescription(description);
  };

  
  const handleOCR = async (file) => {
    setOcrLoading(true);
    toast.showToast('OCR scanner active. Processing receipt...', 'info');
    
    try {
      const imgUrl = URL.createObjectURL(file);
      const { data: { text } } = await Tesseract.recognize(imgUrl, 'eng');
      
      toast.showToast('OCR scanning completed successfully!', 'success');
      
      
      const amountRegex = /(\d{1,5}(\.\d{1,2})?)/g;
      const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2})/g;
      
      const amounts = text.match(amountRegex);
      const dates = text.match(dateRegex);

      if (amounts && amounts.length > 0) {
        
        const sortedAmounts = amounts.map(Number).filter(n => n > 1 && n < 100000);
        if (sortedAmounts.length > 0) {
          const finalVal = sortedAmounts[sortedAmounts.length - 1];
          setAmount(finalVal.toFixed(2));
          toast.showToast(`Extracted amount: ₹${finalVal.toFixed(2)}`, 'success');
        }
      }

      if (dates && dates.length > 0) {
        const extractedDate = formatDateForInput(dates[0]);
        if (extractedDate) setDate(extractedDate);
      }
    } catch (err) {
      toast.showToast('Receipt scanner failed to read file. Fill manually.', 'warning');
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    let parts;
    if (dateStr.includes('/')) {
      parts = dateStr.split('/');
      if (parseInt(parts[0]) > 12) {
        
        [parts[0], parts[1]] = [parts[1], parts[0]];
      }
      return `${parts[2].padStart(4,'20')}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
    }
    if (dateStr.includes('-')) return dateStr;
    return '';
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      toast.showToast('Please fill all mandatory fields.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('date', date);
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('description', description);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      if (editingExpense) {
        await apiRequest(`/expenses/${editingExpense._id || editingExpense.id}`, 'PUT', formData, true);
        toast.showToast('Expense updated successfully!', 'success');
      } else {
        await apiRequest('/expenses', 'POST', formData, true);
        toast.showToast('Expense logged successfully!', 'success');
      }

      setShowFormModal(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      toast.showToast(err.message || 'Error saving transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDeleteId !== id) {
      
      setConfirmDeleteId(id);
      
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    
    setConfirmDeleteId(null);
    try {
      await apiRequest(`/expenses/${id}`, 'DELETE');
      toast.showToast('Expense record deleted.', 'warning');
      fetchExpenses();
    } catch (err) {
      toast.showToast('Failed to delete expense.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      
      <div className="flex flex-col gap-4 p-5 glass-card relative z-30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search description..."
                className="w-full sm:w-60 pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl focus:outline-none focus:border-neonBlue text-sm placeholder:text-textMuted"
              />
            </div>

            
            <div className="flex items-center gap-2 text-xs text-textSecondary w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-textMuted font-medium">Date:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900/40 border border-slate-700/40 rounded-xl focus:outline-none focus:border-neonBlue text-xs text-textSecondary"
              />
              <span>to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900/40 border border-slate-700/40 rounded-xl focus:outline-none focus:border-neonBlue text-xs text-textSecondary"
              />
            </div>
          </div>

          <button onClick={handleOpenAddModal} className="glass-btn-primary py-2 px-5 text-sm w-full lg:w-auto flex items-center justify-center gap-1.5 shrink-0">
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>

        
        <div className="border-t border-glassBorder/30 pt-3">
          <CategoryPillFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
      </div>

      
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="animate-spin text-neonBlue" size={32} />
            <span className="text-xs text-textMuted">Compiling ledger...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glassBorder bg-slate-900/30 text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Receipt</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassBorder/40 text-sm">
                {expenses.length > 0 ? (
                  expenses.map((exp, idx) => (
                    <tr key={exp._id || exp.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3.5 px-6 text-textMuted">{idx + 1}</td>
                      <td className="py-3.5 px-6 font-medium text-textSecondary">
                        {new Date(exp.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-6">
                        {(() => {
                          const config = CATEGORIES_CONFIG[exp.category] || CATEGORIES_CONFIG.Others;
                          const IconComp = config.icon;
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${config.bg} ${config.color} ${config.border} ${config.glow}`}>
                              <IconComp className="w-3.5 h-3.5" />
                              <span>{exp.category}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-6 font-medium max-w-xs truncate">{exp.description || <span className="text-textMuted italic">None</span>}</td>
                      <td className="py-3.5 px-6">
                        {exp.receiptFile ? (
                          <button 
                            onClick={() => setActivePreviewUrl(`${BACKEND_URL}${exp.receiptFile}`)}
                            className="text-xs text-neonBlue hover:underline flex items-center gap-1 font-semibold"
                          >
                            <FileText size={14} /> View File
                          </button>
                        ) : (
                          <span className="text-textMuted">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-neonRose">
                        {currencySymbol}{exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(exp)}
                            className="p-1.5 text-textSecondary hover:text-neonBlue rounded-lg hover:bg-slate-800/50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id || exp.id)}
                            title={confirmDeleteId === (exp._id || exp.id) ? 'Click again to confirm' : 'Delete'}
                            className={`p-1.5 rounded-lg transition-all duration-150 text-xs font-bold ${
                              confirmDeleteId === (exp._id || exp.id)
                                ? 'bg-neonRose/20 text-neonRose border border-neonRose/40 px-2.5'
                                : 'text-textSecondary hover:text-neonRose hover:bg-slate-800/50'
                            }`}
                          >
                            {confirmDeleteId === (exp._id || exp.id) ? 'Confirm?' : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-sm text-textMuted italic">
                      No expense records found. Try clearing filters or add a new transaction.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      {showFormModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg overflow-hidden border border-glassBorder">
            
            
            <div className="flex items-center justify-between p-6 border-b border-glassBorder bg-slate-900/30">
              <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
                {editingExpense ? 'Edit Transaction' : 'Log New Expense'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-textSecondary hover:text-textPrimary">
                <X size={20} />
              </button>
            </div>

            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              
              {!editingExpense && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neonBlue/10 bg-neonBlue/5">
                  <div className="text-xs text-textSecondary">
                    <span className="font-bold text-neonBlue">💡 Pro-Tip:</span> Speak your expense details to autofill fields!
                  </div>
                  <VoiceInput onParsed={handleVoiceParsed} />
                </div>
              )}

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Amount ({currencySymbol}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250.00"
                    className="glass-input py-2 text-sm font-semibold text-textPrimary"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input py-2 text-sm text-textSecondary"
                    required
                  />
                </div>
              </div>

              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Category *</label>
                <CategorySelector
                  value={category}
                  onChange={setCategory}
                />
              </div>

              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. Dinner with friends"
                  className="glass-input py-2 text-sm text-textPrimary"
                />
              </div>

              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Receipt Scan (OCR)</label>
                
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-700/60 hover:border-neonBlue/40 rounded-xl p-5 text-center bg-slate-950/20 transition-all cursor-pointer relative"
                  onClick={() => document.getElementById('receipt-upload-input').click()}
                >
                  <input 
                    id="receipt-upload-input"
                    type="file" 
                    onChange={handleReceiptChange}
                    className="hidden" 
                    accept="image/*"
                  />
                  
                  {ocrLoading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader className="animate-spin text-neonBlue" size={24} />
                      <span className="text-xs text-neonBlue font-semibold animate-pulse">Running OCR Scanner...</span>
                    </div>
                  ) : receiptPreview ? (
                    <div className="flex items-center justify-center gap-4 py-2">
                      <img src={receiptPreview} alt="Receipt" className="w-14 h-14 object-cover rounded border border-glassBorder" />
                      <div className="text-left text-xs">
                        <span className="block font-bold text-textPrimary truncate max-w-[200px]">
                          {receiptFile ? receiptFile.name : 'Receipt file uploaded'}
                        </span>
                        <span className="text-neonBlue underline hover:text-white transition-colors">Replace image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2 text-textSecondary">
                      <Image className="mx-auto text-textMuted mb-2" size={24} />
                      <p className="text-xs">Drag & drop receipt image or click to browse</p>
                      <p className="text-[10px] text-textMuted">Supports PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glassBorder">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="glass-btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="glass-btn-primary py-2 px-4 text-xs"
                >
                  {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Log Transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      
      {activePreviewUrl && (
        <div 
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActivePreviewUrl('')}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center p-2">
            <button 
              className="absolute top-0 right-0 p-2 rounded-full bg-slate-900/80 text-white hover:text-neonRose"
              onClick={() => setActivePreviewUrl('')}
            >
              <X size={24} />
            </button>
            <img 
              src={activePreviewUrl} 
              alt="Receipt Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-glassBorder shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseTracker;
