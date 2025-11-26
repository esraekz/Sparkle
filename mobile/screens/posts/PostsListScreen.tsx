import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';
import PostCard from '../../components/PostCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { postService } from '../../services/post.service';
import type { PostStackParamList, PostStatus } from '../../types';

type PostsListScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'PostsList'>;

type TabFilter = 'all' | PostStatus;

const TABS: Array<{ key: TabFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
];

export default function PostsListScreen() {
  const navigation = useNavigation<PostsListScreenNavigationProp>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch posts based on active filter
  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['posts', activeTab === 'all' ? undefined : activeTab],
    queryFn: () =>
      postService.getPosts(
        activeTab === 'all' ? undefined : activeTab,
        100
      ),
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('EditPost', { postId });
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostMutation.mutateAsync(postId);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const getEmptyStateConfig = (filter: TabFilter) => {
    switch (filter) {
      case 'draft':
        return {
          icon: '📝',
          title: 'No drafts yet',
          message: 'Start writing to create your first draft',
          actionLabel: 'Create Post',
        };
      case 'scheduled':
        return {
          icon: '📅',
          title: 'No scheduled posts',
          message: 'Plan ahead and schedule posts for optimal engagement',
          actionLabel: 'Create Post',
        };
      case 'published':
        return {
          icon: '🎉',
          title: 'No published posts yet',
          message: 'Share your voice! Publish your first post.',
          actionLabel: 'Create Post',
        };
      default:
        return {
          icon: '✨',
          title: 'No posts yet',
          message: 'Create your first post to get started',
          actionLabel: 'Create Post',
        };
    }
  };

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    const allPosts = postsData?.posts || [];

    if (!searchQuery.trim()) {
      return allPosts;
    }

    const query = searchQuery.toLowerCase().trim();
    return allPosts.filter((post) => {
      // Search in content
      if (post.content.toLowerCase().includes(query)) {
        return true;
      }
      // Search in hashtags
      if (post.hashtags.some((tag) => tag.toLowerCase().includes(query))) {
        return true;
      }
      return false;
    });
  }, [postsData?.posts, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading posts..." />
      </SafeAreaView>
    );
  }

  const posts = filteredPosts;
  const emptyConfig = getEmptyStateConfig(activeTab);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Posts</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => handlePostPress(item.id)}
            onDelete={() => handleDeletePost(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon={emptyConfig.icon}
            title={emptyConfig.title}
            message={emptyConfig.message}
            actionLabel={emptyConfig.actionLabel}
            onAction={handleCreatePost}
          />
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
      />

      {/* Floating Action Button */}
      {posts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Layout.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Layout.spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  fabIcon: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 32,
  },
});
