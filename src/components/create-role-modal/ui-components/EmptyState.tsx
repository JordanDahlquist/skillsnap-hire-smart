
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="text-center py-12 text-gray-500">
    <Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <p className="text-lg mb-2">{title}</p>
    <p className="text-sm">{description}</p>
  </div>
);
