
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';

interface BulkStatusSelectorProps {
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

export const BulkStatusSelector = ({ onStatusChange, disabled }: BulkStatusSelectorProps) => {
  const statuses = [
    { value: 'approved', label: 'Approve', color: 'text-green-600' },
    { value: 'reviewed', label: 'Mark as Reviewed', color: 'text-blue-600' },
    { value: 'rejected', label: 'Reject', color: 'text-red-600' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Check className="w-4 h-4 mr-1" />
          Update Status
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={status.color}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
