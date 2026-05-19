import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Copy, Heart, Share2, Crown, Search } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Colors, AD_CONFIG } from '../constants/theme';
import { useApp } from '../hooks/useApp';
import AdService from '../services/AdService';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Female', 'Male', 'Trending', 'Studio', 'Sci-Fi', 'Character Design'];

export default function ExploreScreen() {
  const { isPremium } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [trendingPrompts, setTrendingPrompts] = useState<any[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
    AdService.init();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'explore_prompts'), orderBy('createdAt', 'desc'), limit(30));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setRecentPrompts(docs);
      setTrendingPrompts(docs.filter((d: any) => d.category === 'trending'));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCopy = async (prompt: string, id: string) => {
    await Clipboard.setStringAsync(prompt);
    Toast.show({
      type: 'success',
      text1: 'Prompt Copied Successfully',
      position: 'bottom',
    });
    
    // Interstitial ad logic with cooldown
    AdService.showInterstitial();
  };

  const renderHeader = () => (
    <BlurView intensity={30} tint="dark" style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
            <LinearGradient
                colors={[Colors.purple, Colors.purpleGlow]}
                style={styles.logoIcon}
            >
                <Crown color="white" size={16} />
            </LinearGradient>
            <Text style={styles.headerTitle}>Prompt <Text style={{color: Colors.purple}}>Lab</Text></Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Search color="white" size={24} />
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderCategoryFilters = () => (
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryList}
    >
      {CATEGORIES.map(cat => (
        <TouchableOpacity 
          key={cat} 
          style={[
            styles.categoryChip, 
            selectedCategory === cat && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(cat)}
        >
          <Text style={[
            styles.categoryText, 
            selectedCategory === cat && styles.categoryTextActive
          ]}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTrendingCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.trendingCard} activeOpacity={0.9}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.trendingImage} 
        contentFit="cover"
        transition={1000}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.trendingGradient}
      >
        <View style={styles.trendingContent}>
          <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity 
            style={styles.trendingCopyBtn}
            onPress={() => handleCopy(item.prompt, item.id)}
          >
            <Copy color="white" size={14} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {item.isPremium && (
        <View style={styles.premiumBadge}>
          <Crown color={Colors.gold} size={12} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPromptCard = ({ item, index }: { item: any, index: number }) => {
    // Ad Injection Logic
    if (index === 4 || index === 10 || index === 18) {
      return (
        <View style={styles.nativeAdPlaceholder}>
          <Text style={styles.adLabel}>Native Ad</Text>
          {/* Replace with real Native Ad component */}
          <Text style={styles.adHint}>Visit Premium for Ad-Free Experience</Text>
          <TouchableOpacity style={styles.adCTA}>
            <Text style={styles.adCTAText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.promptCard}>
        <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.promptImage}
            contentFit="cover"
        />
        <View style={styles.promptInfo}>
          <View style={styles.promptHeader}>
            <Text style={styles.promptTitle}>{item.title}</Text>
            <View style={styles.promptActions}>
                <TouchableOpacity style={styles.actionIcon}>
                    <Heart color="white" size={20} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => Share.share({ message: item.prompt })}
                >
                    <Share2 color="white" size={20} />
                </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.promptPreview} numberOfLines={2}>{item.prompt}</Text>
          
          <View style={styles.tagContainer}>
            {item.tags?.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.promptFooter}>
            {item.isPremium && (
                 <Text style={styles.priceText}>${item.price}</Text>
            )}
            <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => handleCopy(item.prompt, item.id)}
            >
                <Copy color="white" size={18} />
                <Text style={styles.copyButtonText}>Copy Prompt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {renderCategoryFilters()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={trendingPrompts}
            renderItem={renderTrendingCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.trendingList}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Prompts</Text>
          </View>

          <FlatList
            data={recentPrompts}
            renderItem={renderPromptCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.recentList}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      
      {/* Banner Ad at bottom (avoid overlapping nav) */}
      <View style={styles.bannerAdContainer}>
        <Text style={styles.adLabelSmall}>Google Test Ad</Text>
        {/* AdMob Banner goes here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.purple,
    fontSize: 14,
    fontWeight: '600',
  },
  trendingList: {
    paddingLeft: 20,
  },
  trendingCard: {
    width: width * 0.45,
    height: 220,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  trendingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  trendingCopyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 10,
  },
  recentList: {
    paddingHorizontal: 20,
  },
  promptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptImage: {
    width: '100%',
    height: 250,
  },
  promptInfo: {
    padding: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  promptActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 15,
  },
  promptPreview: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.purple,
    fontSize: 11,
    fontWeight: '600',
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    backgroundColor: Colors.purple,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 10,
  },
  priceText: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 100, // Above bottom tab
    width: '100%',
    height: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  adLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adLabelSmall: {
    color: Colors.textSecondary,
    fontSize: 10,
    position: 'absolute',
    top: 2,
    left: 5,
  },
  nativeAdPlaceholder: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  adHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 15,
  },
  adCTA: {
    backgroundColor: Colors.purple,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adCTAText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
