import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Layout from '../../constants/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatsCard from '../../components/StatsCard';
import EngagementOverview from '../../components/EngagementOverview';
import ScheduledPostCard from '../../components/ScheduledPostCard';
import EmptyState from '../../components/EmptyState';
import { onboardingService } from '../../services/onboarding.service';
import { postService } from '../../services/post.service';
import { analyticsService } from '../../services/analytics.service';
import type { MainTabParamList, HomeStats } from '../../types';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch brand blueprint for weekly goal and best time
  const { data: brandBlueprint, refetch: refetchBlueprint } = useQuery({
    queryKey: ['brandBlueprint'],
    queryFn: () => onboardingService.getBrandBlueprint(),
  });

  // Fetch scheduled posts
  const { data: scheduledPosts, refetch: refetchScheduled } = useQuery({
    queryKey: ['posts', 'scheduled'],
    queryFn: () => postService.getPosts('scheduled', 10),
  });

  // Fetch published posts to count this week's posts
  const { data: publishedPosts, refetch: refetchPublished } = useQuery({
    queryKey: ['posts', 'published'],
    queryFn: () => postService.getPosts('published', 100),
  });

  // Fetch home stats (mock data for Phase 1)
  const { data: homeStats, refetch: refetchStats, isLoading } = useQuery({
    queryKey: ['homeStats'],
    queryFn: async (): Promise<HomeStats> => {
      // If user has published posts, return mock stats
      // Otherwise return empty stats
      if (publishedPosts && publishedPosts.count > 0) {
        return analyticsService.getHomeStats();
      }
      const weeklyGoal = brandBlueprint?.posting_preferences.posts_per_week || 3;
      return analyticsService.getEmptyStats(weeklyGoal);
    },
    enabled: !!brandBlueprint && publishedPosts !== undefined,
  });

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchBlueprint(),
      refetchScheduled(),
      refetchPublished(),
      refetchStats(),
    ]);
    setRefreshing(false);
  }, [refetchBlueprint, refetchScheduled, refetchPublished, refetchStats]);

  // Count posts from this week
  const getPostsThisWeek = () => {
    if (!publishedPosts) return 0;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    return publishedPosts.posts.filter(post => {
      if (!post.published_at) return false;
      const publishedDate = new Date(post.published_at);
      return publishedDate >= weekStart;
    }).length;
  };

  // Format best time to post
  const getBestTimeToPost = () => {
    if (!brandBlueprint?.posting_preferences.preferred_hours.length) {
      return '9:00 AM';
    }
    const hour = brandBlueprint.posting_preferences.preferred_hours[0];
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Loading state
  if (isLoading || !homeStats || !brandBlueprint) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  const postsThisWeek = getPostsThisWeek();
  const weeklyGoal = brandBlueprint.posting_preferences.posts_per_week;
  const hasScheduledPosts = scheduledPosts && scheduledPosts.count > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Scroll indicator - subtle hint at bottom center */}
      <View style={styles.scrollIndicatorContainer}>
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollIndicatorText}>⌄</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Track your LinkedIn presence</Text>
        </View>

        {/* This Week Stats */}
        <StatsCard
          label="This Week"
          current={postsThisWeek}
          goal={weeklyGoal}
          showCheckmark={postsThisWeek >= weeklyGoal}
        />

        {/* Best Time to Post */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⏰ Best time to post</Text>
          </View>
          <Text style={styles.bestTime}>{getBestTimeToPost()}</Text>
        </View>

        {/* Scheduled Posts - Moved up and made smaller */}
        <View style={styles.compactSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleCompact}>Scheduled Posts</Text>
            {hasScheduledPosts && (
              <TouchableOpacity onPress={() => navigation.navigate('Post')}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasScheduledPosts ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scheduledPostsScroll}
            >
              {scheduledPosts.posts.map(post => (
                <ScheduledPostCard
                  key={post.id}
                  post={post}
                  onPress={() => navigation.navigate('Post')}
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              icon="📝"
              title="No posts scheduled yet"
              message="Create your first post and schedule it for publishing"
              actionLabel="Create Post"
              onAction={() => navigation.navigate('Post')}
            />
          )}
        </View>

        {/* Engagement Overview - Moved to end */}
        <EngagementOverview
          views={homeStats.views}
          viewsTrend={homeStats.viewsTrend}
          engagementRate={homeStats.engagementRate}
          engagementTrend={homeStats.engagementTrend}
        />

        {/* Consistency Streak */}
        <View style={[
          styles.card,
          homeStats.consistencyStreak === 0 && styles.streakCardInactive
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[
              styles.cardTitle,
              homeStats.consistencyStreak === 0 && styles.streakTitleInactive
            ]}>
              {homeStats.consistencyStreak > 0 ? '🔥 Consistency Streak' : '🔥 Start your streak!'}
            </Text>
          </View>
          {homeStats.consistencyStreak > 0 ? (
            <>
              <Text style={styles.streakValue}>
                {homeStats.consistencyStreak} {homeStats.consistencyStreak === 1 ? 'week' : 'weeks'}
              </Text>
              <Text style={styles.streakMessage}>
                Keep going! Consistency is key to building your LinkedIn presence.
              </Text>
            </>
          ) : (
            <Text style={styles.streakMessageInactive}>
              Post consistently to build your streak
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: 200, // Extra space at bottom for scrolling
  },
  header: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  bestTime: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  section: {
    marginBottom: Layout.spacing.md,
  },
  compactSection: {
    marginBottom: Layout.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  sectionTitleCompact: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  viewAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  scheduledPostsScroll: {
    paddingRight: Layout.spacing.lg,
  },
  streakValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  streakMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  streakCardInactive: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray300,
  },
  streakTitleInactive: {
    color: Colors.textSecondary,
  },
  streakMessageInactive: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  scrollIndicator: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollIndicatorText: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});
