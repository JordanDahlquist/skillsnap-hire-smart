
import React from 'react';
import { Search, RefreshCw, Archive, Trash2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ModernInboxHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  totalUnread: number;
}

export const ModernInboxHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onRefresh, 
  totalUnread 
}: ModernInboxHeaderProps) => {
  return (
    <div className="border-b border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Inbox</h1>
          {totalUnread > 0 && (
            <Badge variant="default" className="h-5">
              {totalUnread}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2" />
                Archive all
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-9"
        />
      </div>
    </div>
  );
};
