import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Crown, CheckCircle, CreditCard, Send, X } from 'lucide-react-native';
import SvgQRCode from 'react-native-qrcode-svg';
import { Colors, PAYMENT_CONFIG } from '../constants/theme';
import { useApp } from '../hooks/useApp';
import { db } from '../firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const { isPremium, deviceId } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitUTR = async () => {
    if (utr.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid UTR',
        text2: 'Please enter a valid UTR number from your payment app.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'payment_submissions'), {
        utrNumber: utr,
        deviceId: deviceId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      Toast.show({
        type: 'success',
        text1: 'Submission Successful',
        text2: 'Admin will verify your payment soon.',
      });
      setModalVisible(false);
      setUtr('');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <View style={styles.iconContainer}>
                <Crown color={Colors.gold} size={40} />
            </View>
            <Text style={styles.title}>Go Premium</Text>
            <Text style={styles.subtitle}>Unlock lifetime access to all prompts and enjoy an ad-free experience.</Text>
        </View>

        <View style={styles.features}>
            <FeatureItem text="Unlimited Copying" />
            <FeatureItem text="No Banner Ads" />
            <FeatureItem text="No Interstitial Ads" />
            <FeatureItem text="Premium AI Marketplace" />
            <FeatureItem text="One-time Payment" />
        </View>

        {isPremium ? (
            <View style={styles.alreadyPremium}>
                <CheckCircle color={Colors.purple} size={60} />
                <Text style={styles.premiumText}>Premium Activated</Text>
                <Text style={styles.deviceIdText}>ID: {deviceId}</Text>
            </View>
        ) : (
            <View style={styles.paymentSection}>
                <Text style={styles.priceTitle}>One Time Lifetime Access</Text>
                <Text style={styles.price}>₹99</Text>
                
                <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Crown color="white" size={20} />
                    <Text style={styles.payButtonText}>Get Premium Now</Text>
                </TouchableOpacity>
                <Text style={styles.safeText}>Secure & Professional Payment System</Text>
            </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={90} tint="dark" style={styles.modalContent}>
            <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
            >
                <X color="white" size={24} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Payment Details</Text>
            
            <View style={styles.qrContainer}>
                <SvgQRCode value={PAYMENT_CONFIG.upiId} size={150} color={Colors.text} backgroundColor="transparent" />
            </View>

            <View style={styles.upiBox}>
                <Text style={styles.upiLabel}>UPI ID:</Text>
                <Text style={styles.upiId}>{PAYMENT_CONFIG.upiId}</Text>
            </View>

            <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>1. Pay ₹99 via GPay, PhonePe or Paytm{'\n'}2. Copy the UTR (Transaction ID) number{'\n'}3. Submit it below for verification</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter UTR / Transaction ID"
                    placeholderTextColor={Colors.textSecondary}
                    value={utr}
                    onChangeText={setUtr}
                    keyboardType="number-pad"
                />
            </View>

            <TouchableOpacity 
                style={styles.submitBtn}
                onPress={handleSubmitUTR}
                disabled={submitting}
            >
                <Send color="white" size={18} />
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit UTR'}</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <View style={styles.featureItem}>
            <CheckCircle color={Colors.purple} size={18} />
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 30,
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    color: Colors.text,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  paymentSection: {
    alignItems: 'center',
    width: '100%',
  },
  priceTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 5,
  },
  price: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 25,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: Colors.purple,
    width: '100%',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  safeText: {
    color: Colors.textSecondary,
    marginTop: 15,
    fontSize: 12,
  },
  alreadyPremium: {
    alignItems: 'center',
    marginTop: 20,
  },
  premiumText: {
    color: Colors.purple,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  deviceIdText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: width * 0.9,
    padding: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  qrContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
  },
  upiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  upiLabel: {
    color: Colors.textSecondary,
    marginRight: 10,
  },
  upiId: {
    color: Colors.purple,
    fontWeight: 'bold',
  },
  instructionBox: {
    width: '100%',
    marginBottom: 25,
  },
  instructionText: {
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
    padding: 18,
    borderRadius: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.purple,
    width: '100%',
    padding: 18,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  }
});
