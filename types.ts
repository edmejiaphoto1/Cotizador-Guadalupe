export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  material: string;
  unitPrice: number;
  laborUnitPrice: number;
}

export interface Quote {
  projectName: string;
  clientName: string;
  address: string;
  submissionDeadline: string;
  lineItems: LineItem[];
  taxRate: number;
  projectDescription: string;
  currency: 'USD' | 'CAD' | 'MXN';
}

export interface LanguageStrings {
  [key: string]: {
    title: string;
    quoteFor: string;
    projectName: string;
    clientName: string;
    address: string;
    submissionDeadline: string;
    projectDescription: string;
    generateWithAI: string;
    generating: string;
    items: string;
    description: string;
    quantity: string;
    unit: string;
    material: string;
    unitPrice: string;
    labor: string;
    total: string;
    addItem: string;
    subtotal: string;
    tax: string;
    grandTotal: string;
    printQuote: string;
    remove: string;
    currency: string;
    geminiModalTitle: string;
    geminiModalPrompt: string;
    geminiModalButton: string;
    geminiModalResult: string;
    insertDescription: string;
    close: string;
    resetQuote: string;
    resetConfirmation: string;
  };
}