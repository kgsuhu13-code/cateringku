import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | any;
  className?: string;
}

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  className,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
      className={`bg-slate-200 dark:bg-slate-800 ${className || ''}`}
    />
  );
}

// Preset for a block of text lines
Skeleton.Text = function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <View className={`w-full gap-2.5 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const width = i === lines - 1 ? '60%' : '100%';
        return <Skeleton key={i} width={width} height={13} borderRadius={6} />;
      })}
    </View>
  );
};

// Preset for Shop/Tenant List Item
Skeleton.TenantItem = function SkeletonTenantItem() {
  return (
    <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3 flex-row items-center">
      {/* Icon Placeholder */}
      <Skeleton width={56} height={56} borderRadius={16} className="mr-4" />
      {/* Text Lines Placeholder */}
      <View className="flex-1 gap-2">
        <Skeleton width="55%" height={15} borderRadius={6} />
        <Skeleton width="85%" height={11} borderRadius={4} />
        <Skeleton width="30%" height={9} borderRadius={4} className="mt-1" />
      </View>
    </View>
  );
};

// Preset for Menu List Item
Skeleton.MenuItem = function SkeletonMenuItem() {
  return (
    <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 mb-3">
      <View className="flex-row items-start">
        {/* Food Icon Placeholder */}
        <Skeleton width={64} height={64} borderRadius={16} className="mr-4" />
        <View className="flex-1 gap-2">
          <Skeleton width="45%" height={15} borderRadius={6} />
          <Skeleton width="90%" height={11} borderRadius={4} />
          <View className="flex-row justify-between items-center mt-2">
            <Skeleton width={75} height={16} borderRadius={6} />
            <Skeleton width={50} height={16} borderRadius={12} />
          </View>
        </View>
      </View>
      {/* Button Placeholder */}
      <Skeleton width="100%" height={38} borderRadius={16} className="mt-4" />
    </View>
  );
};
