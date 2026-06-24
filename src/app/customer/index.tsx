import React from 'react';
import { Redirect } from 'expo-router';

export default function CustomerIndex() {
  return <Redirect href={"/customer/home" as any} />;
}
