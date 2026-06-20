import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from 'react-native';
import { styles } from './LoginStyle';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, llena todos los campos.');
      return;
    }
    
    let loginExitoso = false; 

    try {
      const API_URL = 'http://192.168.124.7:5108/api/auth/login'; //CAMBIO DE IP POR RED

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Correo: email,         
          Contrasena: password   
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error de inicio de sesión', errorData.mensaje || 'Credenciales incorrectas.');
        return; 
      }

      const data = await response.json();
      console.log('¡Login exitoso en la app! Datos del usuario:', data);
      
      loginExitoso = true; 

      Alert.alert(
        '¡Bienvenido!', 
        `Hola de nuevo, ${data.nombre} ${data.ap1}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Dashboard'); // Cambia de pantalla
            }
          }
        ],
        { cancelable: false }
      );

    } catch (error) { 
      console.log('Intento de conexión:', error);
      if (!loginExitoso) {
        Alert.alert('Error de red', 'No se pudo establecer conexión con el servidor de NutriTEC.');
      }
    } 
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>🌱 Nutri<Text style={styles.logoBold}>TEC</Text></Text>
          <Text style={styles.subtitle}>Gestiona una vida saludable</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput 
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail} 
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput 
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry={true} 
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword} 
          />

          {/* Botón de Ingresar */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}