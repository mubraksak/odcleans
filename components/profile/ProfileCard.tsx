// components/profile/ProfileCard.tsx
interface ProfileCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actionButton?: React.ReactNode;
}

const ProfileCard = ({ title, description, children, className, actionButton }: ProfileCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {actionButton}
      </div>
      {children}
    </div>
  );
};