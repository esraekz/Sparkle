import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Layout from '../constants/Layout';
import Button from './Button';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (scheduledDate: Date) => void;
}

export default function ScheduleModal({
  visible,
  onClose,
  onSchedule,
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Quick schedule helpers
  const getQuickScheduleDate = (dayOffset: number, hour: number = 9) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const getNextWeekday = (targetDay: number) => {
    // targetDay: 0=Sunday, 1=Monday, ..., 5=Friday
    const date = new Date();
    const currentDay = date.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    date.setDate(date.getDate() + daysToAdd);
    date.setHours(14, 0, 0, 0); // 2:00 PM
    return date;
  };

  const handleQuickSchedule = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setSelectedDate(newDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.handle} />

          <Text style={styles.title}>Schedule Post</Text>

          {/* Quick Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK SCHEDULE</Text>
            <View style={styles.quickScheduleGrid}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickSchedule(getQuickScheduleDate(1, 9))}
              >
                <Text style={styles.quickButtonText}>Tomorrow</Text>
                <Text style={styles.quickButtonTime}>9:00 AM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickSchedule(getNextWeekday(1))}
              >
                <Text style={styles.quickButtonText}>Monday</Text>
                <Text style={styles.quickButtonTime}>2:00 PM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickSchedule(getNextWeekday(3))}
              >
                <Text style={styles.quickButtonText}>Wednesday</Text>
                <Text style={styles.quickButtonTime}>10:00 AM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickSchedule(getNextWeekday(5))}
              >
                <Text style={styles.quickButtonText}>Friday</Text>
                <Text style={styles.quickButtonTime}>3:00 PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CUSTOM SCHEDULE</Text>

            <TouchableOpacity
              style={styles.customInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.customLabel}>Date</Text>
              <Text style={styles.customValue}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.customInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.customLabel}>Time</Text>
              <Text style={styles.customValue}>{formatTime(selectedDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* AI Suggestion */}
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionIcon}>⭐</Text>
            <View style={styles.suggestionTextContainer}>
              <Text style={styles.suggestionTitle}>AI SUGGESTION</Text>
              <Text style={styles.suggestionText}>
                Based on your audience, Tuesday at 2:00 PM gets 34% more engagement
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.actionButton}
            />
            <Button
              title="Schedule"
              variant="primary"
              onPress={() => onSchedule(selectedDate)}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Layout.spacing.sm,
  },
  quickScheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickButton: {
    width: '48%',
    backgroundColor: Colors.gray100,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  quickButtonTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  customInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  customLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  customValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  suggestionContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE89D',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: Layout.spacing.sm,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#B8860B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
