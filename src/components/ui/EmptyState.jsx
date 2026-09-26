import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

// Friendly empty state: icon (lucide component), title, optional description + action
export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-20 px-4"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {description && <p className="text-base-content/60 max-w-md mb-6">{description}</p>}
      {actionLabel &&
        (actionTo ? (
          <Link to={actionTo} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary">
            {actionLabel}
          </button>
        ))}
    </motion.div>
  );
}
