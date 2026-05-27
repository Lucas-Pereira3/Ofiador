import React from "react";

const Table = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

export const TableBody = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>
  );
};

export const TableRow = ({ children, className = "", onClick }) => {
  return (
    <tr
      className={`hover:bg-gray-50/80 transition-colors duration-150 ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableHeader = ({ children, className = "" }) => {
  return (
    <th
      className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = "" }) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}
    >
      {children}
    </td>
  );
};

export default Table;
