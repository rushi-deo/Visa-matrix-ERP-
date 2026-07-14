import React from 'react';

// Define Types for strict Type Safety
interface InvoiceItem {
  id: number;
  description: string;
  hsnSac: string;
  qty: number | string;
  price: number | string;
  total: number | string;
}

export const Invoice: React.FC = () => {
  // Creating placeholder rows matching the exact count from the template image
  const tableRows: InvoiceItem[] = Array.from({ length: 7 }, (_, index) => ({
    id: index + 1,
    description: '',
    hsnSac: '',
    qty: '',
    price: '',
    total: '',
  }));

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Invoice Container */}
      <div className="max-w-[850px] min-h-[1100px] mx-auto bg-white p-10 shadow-sm flex flex-col justify-between print:p-6 print:shadow-none print:min-h-screen">
        
        {/* Top Content Area */}
        <div>
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              {/* Custom SVG replicating the modern/geometric blue logo mark */}
              <svg className="w-11 h-11 text-[#1e60be]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22l10-4 10 4L12 2zm0 3.8l6.8 13.6-6.8-2.7-6.8 2.7L12 5.8z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-none">VISA MATRIX</h1>
                <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">CONSULTING AGENCY</span>
              </div>
            </div>
            
            {/* Invoice Title */}
            <div className="text-4xl font-bold text-[#1e60be] tracking-wider">
              INVOICE
            </div>
          </div>

          {/* Top Divider Strip */}
          <div className="border-t-[3px] border-[#1e60be] mb-6"></div>

          {/* Address Meta Section */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <h3 className="text-gray-500 mb-1.5">Invoice from :</h3>
              <p className="text-lg font-bold text-black leading-tight">Visa Matrix</p>
              <p className="text-xs text-gray-500 mt-1">GSTIN: 27ABAFV2978H1ZS</p>
            </div>
            <div className="text-right pr-12">
              <h3 className="text-gray-500">Invoice to :</h3>
            </div>
          </div>

          {/* Invoice Number Placeholder */}
          <div className="mb-6">
            <h4 className="text-base font-bold text-black">Invoice no :</h4>
          </div>

          {/* Table Grid Component */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1e60be] text-white text-xs font-semibold tracking-wider text-left">
                  <th className="w-[6%] p-2 border-r border-[#1e60be]">NO</th>
                  <th className="w-[42%] p-2 border-r border-[#1e60be]">DESCRIPTION</th>
                  <th className="w-[16%] p-2 border-r border-[#1e60be]">HSN/SAC</th>
                  <th className="w-[8%] p-2 border-r border-[#1e60be]">QTY</th>
                  <th className="w-[14%] p-2 border-r border-[#1e60be]">PRICE</th>
                  <th className="w-[14%] p-2">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={`${
                      index % 2 === 1 ? 'bg-[#d1e4f9]' : 'bg-white'
                    } ${index === tableRows.length - 1 ? 'border-b border-[#d1e4f9]' : ''}`}
                  >
                    <td className="h-9 p-2 border-l border-r border-[#d1e4f9]"></td>
                    <td className="h-9 p-2 border-r border-[#d1e4f9]"></td>
                    <td className="h-9 p-2 border-r border-[#d1e4f9]"></td>
                    <td className="h-9 p-2 border-r border-[#d1e4f9]"></td>
                    <td className="h-9 p-2 border-r border-[#d1e4f9]"></td>
                    <td className="h-9 p-2 border-r border-[#d1e4f9]"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary block */}
          <div className="flex flex-col items-end w-full space-y-2 mb-8 text-sm">
            <div className="flex justify-end w-full">
              <span className="text-gray-500 text-right w-[250px] pr-4">Taxable Value (Visa Service) :</span>
              <span className="w-28 text-left font-medium"></span>
            </div>
            <div className="flex justify-end w-full">
              <span className="text-gray-500 text-right w-[250px] pr-4">CGST 9% :</span>
              <span className="w-28 text-left font-medium"></span>
            </div>
            <div className="flex justify-end w-full">
              <span className="text-gray-500 text-right w-[250px] pr-4">SGST 9% :</span>
              <span className="w-28 text-left font-medium"></span>
            </div>
            <div className="flex justify-end w-full">
              <span className="text-gray-500 text-right w-[250px] pr-4">Government fees :</span>
              <span className="w-28 text-left font-medium"></span>
            </div>
            <div className="flex justify-end w-full">
              <span className="text-gray-500 text-right w-[250px] pr-4">Miscellaneous fees :</span>
              <span className="w-28 text-left font-medium"></span>
            </div>
            
            {/* Grand Total Box */}
            <div className="flex justify-end items-center bg-[#1e60be] text-white w-[400px] py-2 font-bold mt-2">
              <span className="w-[250px] text-right pr-4 tracking-wide">GRAND TOTAL :</span>
              <span className="w-28 text-left"></span>
            </div>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div>
          <div className="flex justify-between items-end mb-4">
            {/* Banking Details Block */}
            <div className="w-1/2">
              <div className="bg-[#1e60be] text-white text-xs font-semibold px-3 py-1.5 inline-block tracking-wide mb-3">
                PAYMENT METHOD :
              </div>
              <div className="text-xs text-gray-800 leading-relaxed border-b border-gray-300 pb-4 max-w-sm">
                Primary holder's name: VISA MATRIX LLP<br />
                Account Number: 5020 0115 8672 84<br />
                Account Type: Current Account<br />
                Bank: HDFC Bank<br />
                IFSC: HDFC0000437<br />
                Branch: PIMPRI - KAMALA CROSSROADS
              </div>
            </div>

            {/* Signature Area */}
            <div className="w-2/5 flex flex-col items-end">
              {/* Fluid vector line representing the original signature placeholder */}
              <svg className="w-36 h-12 -mb-2" viewBox="0 0 150 50" fill="none" stroke="currentColor">
                <path d="M10,35 Q25,15 40,30 T70,20 T100,25 T130,15" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M25,38 Q55,42 110,30" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Terms & Acknowledgements */}
          <div className="mt-4">
            <p className="font-bold text-sm text-black mb-2">Thank you for business with us!</p>
            <div>
              <h5 className="text-xs font-bold text-black mb-1">Term and Conditions :</h5>
              <p className="text-[11px] text-gray-500 max-w-xs leading-normal">
                Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.
              </p>
            </div>
          </div>

          {/* Bottom Contact Footer Strip */}
          <div className="border-t-2 border-[#1e60be] mt-6 pt-4 flex justify-between text-[11px] text-black">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#1e60be]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
              </svg>
              <span>+91 91562 49693</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#1e60be]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>info@visamatrix.in</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 max-w-[260px] leading-tight">
              <svg className="w-3.5 h-3.5 text-[#1e60be] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>
                5th Floor, B Wing, Sukhwani Business Hub<br />
                Nashik Phata, Kasarwadi<br />
                Pimpri-Chinchwad – 411034
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};