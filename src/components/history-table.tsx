"use client";

import React from 'react';
import {ApiRequest} from "@/services/api-caller";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons";
import {cn} from "@/lib/utils";

interface HistoryTableProps {
  history: ApiRequest[];
  onLoad: (entry: ApiRequest) => void;
  onDelete: (entry: ApiRequest) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({history, onLoad, onDelete}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            URL
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Method
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Data
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {history.map((entry, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.url}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.method}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="truncate max-w-[200px]">
                {entry.data}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLoad(entry)}
                className="mr-2"
              >
                <Icons.arrowRight className="mr-2 h-4 w-4"/>
                Load
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(entry)}
              >
                <Icons.trash className="mr-2 h-4 w-4"/>
                Delete
              </Button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      {history.length === 0 && (
        <div className="text-center py-4">
          No history available.
        </div>
      )}
    </div>
  );
};
