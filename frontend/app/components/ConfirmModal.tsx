import { MdClose, MdWarning } from 'react-icons/md';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${colorScheme.bg} flex items-center justify-center shrink-0`}>
              <MdWarning className={`text-2xl ${colorScheme.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-white rounded-xl transition ${colorScheme.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
