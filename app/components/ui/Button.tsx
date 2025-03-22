import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cva, type VariantProps } from "../../lib/cva";
import { cn } from "../../lib/utils";

const buttonVariants = cva("flex-row items-center justify-center rounded-lg", {
  variants: {
    variant: {
      default: "bg-blue-600 active:bg-blue-700",
      destructive: "bg-red-600 active:bg-red-700",
      outline: "border border-gray-300 active:bg-gray-100",
      secondary: "bg-gray-200 active:bg-gray-300",
      ghost: "active:bg-gray-100",
      link: "underline-offset-4 active:underline",
    },
    size: {
      default: "h-12 px-4",
      sm: "h-9 px-3",
      lg: "h-14 px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const textVariants = cva("text-base font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-gray-900",
      secondary: "text-gray-900",
      ghost: "text-gray-900",
      link: "text-blue-600 underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

const Button = ({
  children,
  variant,
  size,
  className,
  textClassName,
  onPress,
  disabled = false,
  loading = false,
}: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50",
        className,
      )}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "default" || variant === "destructive"
              ? "white"
              : "black"
          }
          className="mr-2"
        />
      )}
      {typeof children === "string" ? (
        <Text className={cn(textVariants({ variant }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export { Button, buttonVariants };
