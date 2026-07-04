import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { create } from 'zustand';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  buttons: AlertButton[];
  showAlert: (
    title: string,
    message: string,
    buttons?: AlertButton[],
    type?: AlertType
  ) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  type: 'info',
  buttons: [],
  showAlert: (title, message, buttons = [{ text: 'OK' }], type = 'info') =>
    set({ visible: true, title, message, buttons, type }),
  hideAlert: () => set({ visible: false }),
}));

// Quick access helper
export const customAlert = {
  show: (title: string, message: string, buttons?: AlertButton[], type?: AlertType) => {
    useAlertStore.getState().showAlert(title, message, buttons, type);
  },
  info: (title: string, message: string, buttons?: AlertButton[]) => {
    useAlertStore.getState().showAlert(title, message, buttons, 'info');
  },
  success: (title: string, message: string, buttons?: AlertButton[]) => {
    useAlertStore.getState().showAlert(title, message, buttons, 'success');
  },
  warning: (title: string, message: string, buttons?: AlertButton[]) => {
    useAlertStore.getState().showAlert(title, message, buttons, 'warning');
  },
  error: (title: string, message: string, buttons?: AlertButton[]) => {
    useAlertStore.getState().showAlert(title, message, buttons, 'error');
  },
};

export default function CustomAlert() {
  const { visible, title, message, type, buttons, hideAlert } = useAlertStore();

  if (!visible) return null;

  // Render Icon according to Alert Type
  const renderIcon = () => {
    const size = 36;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={size} color="#16a34a" strokeWidth={2} />;
      case 'warning':
        return <AlertTriangle size={size} color="#d97706" strokeWidth={2} />;
      case 'error':
        return <XCircle size={size} color="#dc2626" strokeWidth={2} />;
      case 'info':
      default:
        return <Info size={size} color="#2563eb" strokeWidth={2} />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <View className="bg-white dark:bg-slate-900 w-[90%] max-w-[400px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
          
          {/* Header Icon */}
          <View className={`items-center py-6 ${getHeaderBg()}`}>
            {renderIcon()}
          </View>

          {/* Text Content */}
          <View className="p-6 items-center">
            <Text className="text-slate-850 dark:text-white text-lg font-black text-center mb-2">
              {title}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center leading-5">
              {message}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-6 flex-row gap-3">
            {buttons.map((btn, index) => {
              // Custom button styles
              let btnClass = 'flex-1 h-[48px] rounded-2xl items-center justify-center';
              let textClass = 'font-extrabold text-sm';

              if (btn.style === 'cancel') {
                btnClass += ' bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
                textClass += ' text-slate-650 dark:text-slate-300';
              } else if (btn.style === 'destructive') {
                btnClass += ' bg-red-600';
                textClass += ' text-white';
              } else {
                // default style (success green brand color)
                btnClass += ' bg-green-600';
                textClass += ' text-white';
              }

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  className={btnClass}
                  onPress={() => {
                    hideAlert();
                    if (btn.onPress) {
                      btn.onPress();
                    }
                  }}
                >
                  <Text className={textClass}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // slate-900 back-drop shadow
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },
});
