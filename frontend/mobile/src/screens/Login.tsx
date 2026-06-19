import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { styles } from './LoginStyle';

export default function LoginScreen() {
  // Estados para almacenar las credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Conectar a la api
    console.log('Intentando iniciar sesión con:', { email, password });
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
            onChangeText={setEmail} // Actualiza el estado del email
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput 
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry={true} 
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword} // Actualiza el estado de la contraseña
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
