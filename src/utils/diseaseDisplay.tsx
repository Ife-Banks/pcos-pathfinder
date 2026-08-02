import {
  Heart, Droplets, Activity, HeartPulse, Brain, Target, Moon,
  Thermometer, Stethoscope, Sun, Smile, Frown, Zap, Shield,
} from "lucide-react";
import React from "react";

export const expandAbbreviation = (key: string): string => {
  const mapping: Record<string, string> = {
    'T2D': 'Type 2 Diabetes',
    'CVD': 'Cardiovascular Disease',
    'PMDD': 'Premenstrual Dysphoric Disorder',
    'CLV': 'Cycle Length Variation',
    'Metabolic': 'Metabolic Syndrome',
    'METS': 'Metabolic Syndrome',
    'MetSyn': 'Metabolic Syndrome',
    'Stroke': 'Stroke',
    'HF': 'Heart Failure',
    'HeartFailure': 'Heart Failure',
    'ChronicStress': 'Chronic Stress',
    'Endometrial': 'Endometrial Cancer',
    'Infertility_Mood': 'Infertility',
    'Cardiovascular_Disease': 'Cardiovascular Disease',
    'Type_2_Diabetes': 'Type 2 Diabetes',
    'Metabolic_Syndrome': 'Metabolic Syndrome',
    'Heart_Failure': 'Heart Failure',
    'Chronic_Stress': 'Chronic Stress',
    'Infertility': 'Infertility',
    'Sleep_Quality': 'Sleep Quality',
    'Focus_Memory': 'Focus & Memory',
    'Mental_Wellness': 'Mental Wellness',
    'Mood_Score': 'Mood Check',
  };
  return mapping[key] || key.replace(/_/g, ' ');
};

export const getUnifiedSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#dc2626';
    case 'Severe': return '#ea580c';
    case 'Moderate': return '#d97706';
    case 'Mild': return '#2563eb';
    case 'Minimal': return '#16a34a';
    default: return '#6b7280';
  }
};

export const getUnifiedSeverityBg = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#fef2f2';
    case 'Severe': return '#fff7ed';
    case 'Moderate': return '#fffbeb';
    case 'Mild': return '#eff6ff';
    case 'Minimal': return '#f0fdf4';
    default: return '#f9fafb';
  }
};

export const getDiseaseBorderColor = (severity: string): string => {
  switch (severity) {
    case 'Extreme': return '#dc2626';
    case 'Severe': return '#ea580c';
    case 'Moderate': return '#d97706';
    case 'Mild': return '#2563eb';
    case 'Minimal': return '#16a34a';
    default: return '#d1d5db';
  }
};

export const getWellnessColor = (severity: string): string => {
  switch (severity) {
    case 'Excellent': return '#16a34a';
    case 'Good': return '#0d9488';
    case 'Moderate': return '#d97706';
    case 'Below Average': return '#ea580c';
    case 'Poor': return '#dc2626';
    default: return '#6b7280';
  }
};

export const getWellnessBg = (severity: string): string => {
  switch (severity) {
    case 'Excellent': return '#f0fdf4';
    case 'Good': return '#f0fdfa';
    case 'Moderate': return '#fffbeb';
    case 'Below Average': return '#fff7ed';
    case 'Poor': return '#fef2f2';
    default: return '#f9fafb';
  }
};

export const getDiseaseIcon = (disease: string, color?: string): React.ReactNode => {
  const iconClass = "w-5 h-5 shrink-0";
  const c = color || '#6b7280';
  switch (disease) {
    case 'CVD': return <Heart className={iconClass} style={{ color: c }} />;
    case 'T2D': return <Droplets className={iconClass} style={{ color: c }} />;
    case 'Metabolic': return <Activity className={iconClass} style={{ color: c }} />;
    case 'HeartFailure': return <HeartPulse className={iconClass} style={{ color: c }} />;
    case 'ChronicStress': return <Brain className={iconClass} style={{ color: c }} />;
    case 'Infertility': return <Target className={iconClass} style={{ color: c }} />;
    case 'PMDD': return <Moon className={iconClass} style={{ color: c }} />;
    case 'Dysmenorrhea': return <Thermometer className={iconClass} style={{ color: c }} />;
    case 'Endometrial': return <Stethoscope className={iconClass} style={{ color: c }} />;
    case 'Sleep_Quality': return <Moon className={iconClass} style={{ color: c }} />;
    case 'Focus_Memory': return <Brain className={iconClass} style={{ color: c }} />;
    case 'Mental_Wellness': return <Heart className={iconClass} style={{ color: c }} />;
    case 'Mood_Score': return <Sun className={iconClass} style={{ color: c }} />;
    case 'Anxiety': return <Smile className={iconClass} style={{ color: c }} />;
    case 'Depression': return <Frown className={iconClass} style={{ color: c }} />;
    case 'Stroke': return <Zap className={iconClass} style={{ color: c }} />;
    case 'MetSyn': return <Shield className={iconClass} style={{ color: c }} />;
    case 'Infertility_Mood': return <Target className={iconClass} style={{ color: c }} />;
    case 'CVD_Mood': return <Heart className={iconClass} style={{ color: c }} />;
    case 'T2D_Mood': return <Droplets className={iconClass} style={{ color: c }} />;
    case 'MetSyn_Mood': return <Shield className={iconClass} style={{ color: c }} />;
    case 'Stroke_Mood': return <Zap className={iconClass} style={{ color: c }} />;
    default: return <Activity className={iconClass} style={{ color: c }} />;
  }
};

export const WELLNESS_KEYS = ['Sleep_Quality', 'Focus_Memory', 'Mental_Wellness', 'Mood_Score'];

export const DISEASE_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Mental Health', keys: [...WELLNESS_KEYS, 'Anxiety', 'Depression', 'ChronicStress', 'PMDD'] },
  { title: 'Metabolic Health', keys: ['T2D', 'Metabolic'] },
  { title: 'Cardiovascular & Neurological Health', keys: ['CVD', 'Stroke', 'HeartFailure'] },
  { title: 'Reproductive Health', keys: ['Infertility', 'Endometrial', 'Dysmenorrhea'] },
];
