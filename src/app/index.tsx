
import { useState, useRef} from 'react';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const deviceTheme = useColorScheme();
  const isDark = deviceTheme === 'dark';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const router = useRouter();

  const colors = {
    background: isDark ? '#121212' : '#F5F7FA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#17202A',
    secondary: isDark ? '#B0B0B0' : '#657080',
    border: isDark ? '#404040' : '#DDE3EA',
    primary: '#1976D2',
  };

  const styles = createStyles(colors);

  function handleLogin() {
    if (username === '1234' && password === '1234') {
      router.replace('/chofer');
      return;
    }

    alert('Usuario o contraseña incorrectos.');
  }

  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <StatusBar style={isDark ? 'light' : 'dark'} />

    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      >
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/acachete-log.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>
          Ingresá a tu cuenta de Acachete Encomiendas
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Ingresá tu usuario"
            placeholderTextColor={colors.secondary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
            accessibilityLabel="Usuario"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresá tu contraseña"
              placeholderTextColor={colors.secondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              ref={passwordRef}
              onSubmitEditing={handleLogin}
              accessibilityLabel="Contraseña"
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              <Text style={styles.showText}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
            onPress={handleLogin}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Acachete Encomiendas</Text>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: {
  background: string;
  surface: string;
  text: string;
  secondary: string;
  border: string;
  primary: string;
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 24,
    },
    logo: {
      width: 190,
      height: 145,
      alignSelf: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondary,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 30,
    },
    form: {
      backgroundColor: colors.surface,
      padding: 22,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      color: colors.text,
      marginBottom: 20,
      fontSize: 15,
    },
    passwordContainer: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 24,
    },
    passwordInput: {
      flex: 1,
      height: '100%',
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 15,
    },
    showButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    showText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    loginButton: {
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginButtonPressed: {
      opacity: 0.8,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      color: colors.secondary,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 28,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });
}
