import React, { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Quote, LineItem } from './types';
import { INITIAL_QUOTE, STRINGS } from './constants';
import { TrashIcon, PlusIcon, SparklesIcon } from './components/icons';
import GeminiModal from './components/GeminiModal';

export type Language = 'es' | 'en';

const App: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(INITIAL_QUOTE);
  const [language, setLanguage] = useState<Language>('es');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const s = STRINGS[language];

  const handleQuoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuote(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLineItemChange = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setQuote(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const addLineItem = useCallback(() => {
    const newItem: LineItem = { id: uuidv4(), description: '', quantity: 1, unit: 'unidad', material: '', unitPrice: 0, laborUnitPrice: 0 };
    setQuote(prev => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setQuote(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }));
  }, []);

  const { subtotal, taxAmount, grandTotal } = useMemo(() => {
    const subtotal = quote.lineItems.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const laborUnitPrice = Number(item.laborUnitPrice) || 0;
      return acc + (quantity * (unitPrice + laborUnitPrice));
    }, 0);
    const taxRate = Number(quote.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  }, [quote.lineItems, quote.taxRate]);

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(language === 'es' ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency: quote.currency,
    });
  }, [language, quote.currency]);

  const handlePrint = () => {
    window.print();
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };
  
  const handleInsertDescription = (text: string) => {
    setQuote(prev => ({ ...prev, projectDescription: text }));
  };

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 print:p-0">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none">
          <header className="bg-gray-800 text-white p-6 rounded-t-lg print:bg-transparent print:text-black print:p-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{s.title}</h1>
                <p className="text-gray-300 print:text-gray-600">{s.quoteFor}: {quote.clientName}</p>
              </div>
              <div className="print:hidden">
                <button
                  onClick={toggleLanguage}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  {language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                </button>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-8">
            {/* Project Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label={s.projectName} name="projectName" value={quote.projectName} onChange={handleQuoteChange} />
                <Input label={s.clientName} name="clientName" value={quote.clientName} onChange={handleQuoteChange} />
                <Input label={s.address} name="address" value={quote.address} onChange={handleQuoteChange} />
              </div>
              <div className="space-y-4">
                 <Input label={s.submissionDeadline} name="submissionDeadline" type="date" value={quote.submissionDeadline} onChange={handleQuoteChange} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{s.projectDescription}</label>
                    <textarea name="projectDescription" value={quote.projectDescription} onChange={handleQuoteChange} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                    <button onClick={() => setIsModalOpen(true)} className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        <SparklesIcon className="w-4 h-4 mr-1"/>{s.generateWithAI}
                    </button>
                 </div>
              </div>
            </section>

            {/* Line Items Table */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{s.items}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">{s.description}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.quantity}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.unit}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.material}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.unitPrice}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.labor}</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{s.total}</th>
                      <th className="print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.lineItems.map(item => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        onChange={handleLineItemChange}
                        onRemove={removeLineItem}
                        formatter={currencyFormatter}
                        s={s}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addLineItem} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 print:hidden">
                <PlusIcon className="w-5 h-5 mr-2" />
                {s.addItem}
              </button>
            </section>

            {/* Totals */}
            <section className="flex justify-end">
              <div className="w-full md:w-1/2 lg:w-2/5 space-y-4 bg-gray-800 text-white p-6 rounded-lg">
                 <div className="flex items-center justify-between">
                  <label htmlFor="currency" className="text-sm font-medium">{s.currency}</label>
                  <select id="currency" name="currency" value={quote.currency} onChange={handleQuoteChange} className="w-2/3 p-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                    <option value="MXN">MXN</option>
                  </select>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{s.subtotal}</span>
                  <span className='font-medium'>{currencyFormatter.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center">
                    <label htmlFor="taxRate" className="mr-2">{s.tax} (%)</label>
                    <input id="taxRate" name="taxRate" type="number" value={quote.taxRate} onChange={e => setQuote({...quote, taxRate: Number(e.target.value)})} className="w-16 p-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black" />
                  </div>
                  <span className='font-medium'>{currencyFormatter.format(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white mt-4 pt-4 border-t border-gray-600">
                  <span>{s.grandTotal}</span>
                  <span>{currencyFormatter.format(grandTotal)}</span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="pt-6 border-t border-gray-200 text-center print:hidden">
              <button onClick={handlePrint} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                {s.printQuote}
              </button>
            </section>
          </main>
        </div>
      </div>
      <GeminiModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onInsert={handleInsertDescription}
        language={language}
      />
    </>
  );
};

interface InputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const Input: React.FC<InputProps> = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

interface LineItemRowProps {
  item: LineItem;
  onChange: (id: string, field: keyof LineItem, value: string | number) => void;
  onRemove: (id: string) => void;
  formatter: Intl.NumberFormat;
  s: typeof STRINGS['es'];
}

const LineItemRow: React.FC<LineItemRowProps> = ({ item, onChange, onRemove, formatter, s }) => {
  const total = useMemo(() => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const laborUnitPrice = Number(item.laborUnitPrice) || 0;
    return quantity * (unitPrice + laborUnitPrice);
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onChange(item.id, name as keyof LineItem, type === 'number' ? Number(value) : value);
  };

  return (
    <tr>
      <td className="px-3 py-2"><input type="text" name="description" value={item.description} onChange={handleInputChange} className="w-full p-1 border-gray-300 rounded-md" placeholder={s.description} /></td>
      <td className="px-3 py-2"><input type="number" name="quantity" value={item.quantity} onChange={handleInputChange} className="w-20 p-1 border-gray-300 rounded-md" /></td>
      <td className="px-3 py-2"><input type="text" name="unit" value={item.unit} onChange={handleInputChange} className="w-24 p-1 border-gray-300 rounded-md" placeholder={s.unit}/></td>
      <td className="px-3 py-2"><input type="text" name="material" value={item.material} onChange={handleInputChange} className="w-full p-1 border-gray-300 rounded-md" placeholder={s.material}/></td>
      <td className="px-3 py-2"><input type="number" name="unitPrice" value={item.unitPrice} onChange={handleInputChange} className="w-24 p-1 border-gray-300 rounded-md" /></td>
      <td className="px-3 py-2"><input type="number" name="laborUnitPrice" value={item.laborUnitPrice} onChange={handleInputChange} className="w-24 p-1 border-gray-300 rounded-md" /></td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 font-medium">{formatter.format(total)}</td>
      <td className="px-3 py-2 text-right print:hidden">
        <button onClick={() => onRemove(item.id)} title={s.remove} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default App;