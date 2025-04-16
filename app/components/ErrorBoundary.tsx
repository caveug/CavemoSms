import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BugWizardTracker } from "./BugWizard";
import { RefreshCw } from "lucide-react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  id?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report to BugWizard
    BugWizardTracker.reportBug({
      type: "error",
      message: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, id } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 my-2">
          <Text className="text-red-700 font-bold mb-2">
            Something went wrong {id ? `in ${id}` : ""}
          </Text>
          <Text className="text-red-600 mb-4">
            {error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            className="bg-red-100 self-start px-4 py-2 rounded-lg flex-row items-center"
            onPress={this.resetError}
          >
            <RefreshCw size={16} color="#DC2626" />
            <Text className="text-red-700 ml-2">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return children;
  }
}
