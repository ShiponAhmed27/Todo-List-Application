import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, FilterType, Todo } from '@/types/todo';

const CATEGORIES: { label: Category; color: string; bg: string }[] = [
  { label: 'Study', color: '#7C3AED', bg: '#EDE9FE' },
  { label: 'Work', color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Personal', color: '#DB2777', bg: '#FCE7F3' },
  { label: 'Health', color: '#059669', bg: '#D1FAE5' },
  { label: 'Shopping', color: '#D97706', bg: '#FEF3C7' },
];

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    text: 'Complete Lab Task 1 for React Native',
    completed: true,
    category: 'Study',
    createdAt: 'Today, 9:00 AM',
  },
  {
    id: '2',
    text: 'Implement useState hook and FlatList component',
    completed: true,
    category: 'Study',
    createdAt: 'Today, 10:15 AM',
  },
  {
    id: '3',
    text: 'Design modern responsive UI with statistics header',
    completed: false,
    category: 'Work',
    createdAt: 'Today, 11:30 AM',
  },
  {
    id: '4',
    text: 'Push repository to GitHub and submit classroom link',
    completed: false,
    category: 'Study',
    createdAt: 'Today, 1:00 PM',
  },
  {
    id: '5',
    text: 'Review documentation and take project screenshots',
    completed: false,
    category: 'Personal',
    createdAt: 'Today, 2:45 PM',
  },
];

export default function TodoApp() {
  // Application state managed via useState hook
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Study');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Computed statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((item) => item.completed).length;
  const remainingCount = todos.filter((item) => !item.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks according to selected filter and search query
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'completed' ? todo.completed : !todo.completed;
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesFilter && matchesSearch;
  });

  // Add new task dynamically
  const handleAddTodo = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      Alert.alert('Empty Task', 'Please enter a task description before adding.');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      category: selectedCategory,
      createdAt: 'Just now',
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
    Keyboard.dismiss();
  };

  // Toggle completed status
  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  // Delete task from list
  const handleDeleteTodo = (id: string, text: string) => {
    const performDelete = () => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${text}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Task', `Are you sure you want to delete "${text}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    if (completedCount === 0) return;

    const performClear = () => {
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete all completed tasks?')) {
        performClear();
      }
    } else {
      Alert.alert('Clear Completed', 'Are you sure you want to remove all completed tasks?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: performClear },
      ]);
    }
  };

  const getCategoryMeta = (cat: Category) => {
    return CATEGORIES.find((c) => c.label === cat) || CATEGORIES[0];
  };

  // Render individual todo item card
  const renderTodoItem = ({ item }: { item: Todo }) => {
    const catMeta = getCategoryMeta(item.category);

    return (
      <View style={[styles.todoCard, item.completed && styles.todoCardCompleted]}>
        {/* Toggle Checkbox */}
        <TouchableOpacity
          onPress={() => handleToggleTodo(item.id)}
          style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}>
          {item.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Task Details */}
        <TouchableOpacity
          style={styles.todoContent}
          onPress={() => handleToggleTodo(item.id)}
          activeOpacity={0.7}>
          <Text
            style={[styles.todoText, item.completed && styles.todoTextCompleted]}
            numberOfLines={2}>
            {item.text}
          </Text>

          <View style={styles.todoMetaRow}>
            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: catMeta.bg }]}>
              <View style={[styles.categoryDot, { backgroundColor: catMeta.color }]} />
              <Text style={[styles.categoryBadgeText, { color: catMeta.color }]}>
                {item.category}
              </Text>
            </View>

            {/* Created timestamp */}
            <View style={styles.timestampBadge}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.timestampText}>{item.createdAt}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => handleDeleteTodo(item.id, item.text)}
          style={styles.deleteButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Delete task ${item.text}`}>
          <Ionicons name="trash-outline" size={19} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render Header Component inside FlatList
  const renderListHeader = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.headerContainer}>
        {/* App Title & Date Banner */}
        <View style={styles.appTitleRow}>
          <View>
            <Text style={styles.appSubtitle}>{today}</Text>
            <Text style={styles.appTitle}>My Todo List</Text>
          </View>
          <View style={styles.appIconBadge}>
            <Ionicons name="checkbox-outline" size={26} color="#4F46E5" />
          </View>
        </View>

        {/* Statistics Dashboard Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRemaining]}>
            <View style={styles.statHighlightBadge}>
              <Text style={styles.statNumberRemaining}>{remainingCount}</Text>
            </View>
            <Text style={styles.statLabelRemaining}>Remaining</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumberCompleted}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Completion Progress</Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Task Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputSectionTitle}>Add New Task</Text>

          {/* Category Selector Pills */}
          <View style={styles.categoryPickerRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setSelectedCategory(cat.label)}
                  style={[
                    styles.categoryChip,
                    isSelected
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
                  ]}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: '#64748B' },
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input field + Add Button */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Ionicons name="create-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="What needs to be done?"
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddTodo}
                returnKeyType="done"
              />
              {inputText.length > 0 && (
                <TouchableOpacity onPress={() => setInputText('')} style={styles.clearInputBtn}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleAddTodo}
              style={[
                styles.addButton,
                !inputText.trim() && styles.addButtonDisabled,
              ]}
              disabled={!inputText.trim()}
              activeOpacity={0.8}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Filter Section */}
        <View style={styles.filterSection}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs Row */}
          <View style={styles.filterTabsRow}>
            <View style={styles.filterPillsGroup}>
              {(['all', 'active', 'completed'] as FilterType[]).map((tab) => {
                const isActive = filter === tab;
                const count =
                  tab === 'all'
                    ? totalCount
                    : tab === 'active'
                    ? remainingCount
                    : completedCount;

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setFilter(tab)}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive && styles.filterPillTextActive,
                      ]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        isActive ? styles.filterBadgeActive : styles.filterBadgeInactive,
                      ]}>
                      <Text
                        style={[
                          styles.filterBadgeText,
                          isActive ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive,
                        ]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {completedCount > 0 && (
              <TouchableOpacity
                onPress={handleClearCompleted}
                style={styles.clearCompletedBtn}
                activeOpacity={0.7}>
                <Ionicons name="sparkles-outline" size={14} color="#EF4444" />
                <Text style={styles.clearCompletedText}>Clear Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>
            {filter === 'all'
              ? 'All Tasks'
              : filter === 'active'
              ? 'Active Tasks'
              : 'Completed Tasks'}
          </Text>
          <Text style={styles.sectionHeaderCount}>
            Showing {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      </View>
    );
  };

  // Render Empty State when no tasks match
  const renderListEmpty = () => {
    let emptyTitle = 'No tasks found';
    let emptySubtitle = 'Try adding a new task or changing your filter above.';
    let iconName: keyof typeof Ionicons.glyphMap = 'clipboard-outline';

    if (filter === 'completed') {
      emptyTitle = 'No completed tasks yet';
      emptySubtitle = 'Complete your tasks to see them tracked here.';
      iconName = 'checkmark-circle-outline';
    } else if (filter === 'active') {
      emptyTitle = 'All caught up!';
      emptySubtitle = 'Great job! You have zero pending tasks right now.';
      iconName = 'sparkles-outline';
    } else if (searchQuery.trim()) {
      emptyTitle = 'No matching tasks';
      emptySubtitle = `No tasks matching "${searchQuery}".`;
      iconName = 'search-outline';
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name={iconName} size={42} color="#6366F1" />
        </View>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Main FlatList rendering tasks */}
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderListEmpty}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* Header Section */
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  appTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  appIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
    }),
  },
  statCardRemaining: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  statNumberRemaining: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statNumberCompleted: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
  },
  statHighlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  statLabelRemaining: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
    marginTop: 4,
  },

  /* Progress Bar */
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4F46E5',
  },

  /* Input Card */
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      },
    }),
  },
  inputSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  clearInputBtn: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Filter Section */
  filterSection: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
  },
  filterTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  filterBadgeActive: {
    backgroundColor: '#3730A3',
  },
  filterBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  filterBadgeTextInactive: {
    color: '#64748B',
  },
  clearCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  clearCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: '#94A3B8',
  },

  /* Todo Card Item */
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      },
    }),
  },
  todoCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.75,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  todoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
