import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView, 
  Platform,
  TextInput
} from 'react-native';
import { styles } from './ClientStyles';


const API_BASE_URL = "http://localhost:5108"; 

interface Comida {
  fecha: string;
  tiempo: string;
  detalle: string;
  calorias: number;
}

interface Producto {
  id_producto?: number;
  id?: number;
  nombre?: string;
  descripcion?: string;
  energia?: number;
  codigoBarras?: any;
}

interface Receta {
  id_receta?: number;
  id?: number;
  nombre?: string;
  energiaTotal?: number;
  energia?: number;
}

interface Props {
  navigation: any; 
  route: any; 
}

export default function ClientDashboardScreen({ navigation, route }: Props) {
  const idClienteLogueado = route.params?.usuario || route.params?.id_usuario || route.params?.idCliente || route.params?.id || 4; 
  console.log('ID Cliente Logueado actual:', idClienteLogueado, '| route.params:', route.params);

  const [comidasAsignadas, setComidasAsignadas] = useState<Comida[]>([]);
  const [fechaPivote, setFechaPivote] = useState<Date>(new Date());
  
  const [fechaSeleccionadaStr, setFechaSeleccionadaStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [caloriasTotales, setCaloriasTotales] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);


  const [nuevoTiempo, setNuevoTiempo] = useState<string>('almuerzo');
  const [porcionComida, setPorcionComida] = useState<string>('1');

  
  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [filtroAlimento, setFiltroAlimento] = useState<string>('');
  const [listaRecetas, setListaRecetas] = useState<Receta[]>([]);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<any>(null);

  const opcionesTiempos = [
    { value: 'desayuno', label: 'Desayuno' },
    { value: 'merienda_manana', label: 'Merienda Mañana' },
    { value: 'almuerzo', label: 'Almuerzo' },
    { value: 'merienda_tarde', label: 'Merienda Tarde' },
    { value: 'cena', label: 'Cena' }
  ];

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const diasSemanaLetras = ['L', 'K', 'M', 'J', 'V', 'S', 'D'];

  const obtenerDiasDeLaSemana = (fechaBase: Date): Date[] => {
    const copia = new Date(fechaBase);
    const diaSemanaIdx = copia.getDay();
    const distanciaAlLunes = diaSemanaIdx === 0 ? -6 : 1 - diaSemanaIdx;
    const lunesDeEstaSemana = new Date(copia.setDate(copia.getDate() + distanciaAlLunes));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunesDeEstaSemana);
      d.setDate(lunesDeEstaSemana.getDate() + i);
      return d;
    });
  };

  const diasDeEstaSemana = obtenerDiasDeLaSemana(fechaPivote);

  const formatearFechaISO = (objetoFecha: Date): string => {
    const yyyy = objetoFecha.getFullYear();
    const mm = String(objetoFecha.getMonth() + 1).padStart(2, '0');
    const dd = String(objetoFecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };


  useEffect(() => {
    const cargarProductosAPI = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/producto`);
        if (response.ok) {
          const datos = await response.json();
          setListaProductos(datos);
        }
      } catch (error) {
        console.error("Error cargando productos en móvil:", error);
      }
    };
    cargarProductosAPI();
  }, []);

  useEffect(() => {
    const cargarRecetasCliente = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/receta/cliente/${idClienteLogueado}`
        );

        if (response.ok) {
          const datos = await response.json();
          setListaRecetas(datos);
        }
      } catch (error) {
        console.error("Error cargando recetas del cliente:", error);
      }
    };

    cargarRecetasCliente();
  }, [idClienteLogueado]);


  const cargarConsumoDiarioAPI = async () => {
    setLoading(true);
    try {
      const promesasSemanales = diasDeEstaSemana.map(dia =>
        fetch(`${API_BASE_URL}/api/cliente/${idClienteLogueado}/registro?fecha=${formatearFechaISO(dia)}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const resultadosSemanales = await Promise.all(promesasSemanales);
      const listaPlanaFormateada: Comida[] = [];

      resultadosSemanales.forEach((data, index) => {
      if (!data) return;

      const fechaCeldaLoop = formatearFechaISO(diasDeEstaSemana[index]);

      if (!data.registros || !Array.isArray(data.registros)) return;

      data.registros.forEach((registro: any) => {
        const tiempo = registro.tiempo || "desayuno";

        if (!registro.productos || !Array.isArray(registro.productos)) return;

        registro.productos.forEach((producto: any) => {
          listaPlanaFormateada.push({
            fecha: data.fecha ? data.fecha.split("T")[0] : fechaCeldaLoop,
            tiempo: tiempo.replace("_", " ").toLowerCase().trim(),
            detalle: producto.descripcion || "Alimento",
            calorias: Number(producto.energia) || 0
          });
        });
      });
    });

      setComidasAsignadas(listaPlanaFormateada);
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertarComida = async () => {
    if (!alimentoSeleccionado) {
      Alert.alert(
        'Selección requerida',
        'Por favor, busque y seleccione un producto o receta.'
      );
      return;
    }

    const cantidadNumerica = parseFloat(porcionComida) || 1;

    try {
      if (alimentoSeleccionado.tipo === 'receta') {
        const idReceta = alimentoSeleccionado.id_receta || alimentoSeleccionado.id;

        const responseReceta = await fetch(`${API_BASE_URL}/api/receta/${idReceta}`);

        if (!responseReceta.ok) {
          Alert.alert('Error', 'No se pudo obtener el detalle de la receta.');
          return;
        }

        const recetaDetalle = await responseReceta.json();

        if (!recetaDetalle.productos || recetaDetalle.productos.length === 0) {
          Alert.alert('Error', 'La receta no tiene productos registrados.');
          return;
        }

        for (const producto of recetaDetalle.productos) {
          const datosRegistro = {
            id_cliente: idClienteLogueado,
            idCliente: idClienteLogueado,
            fecha: fechaSeleccionadaStr,
            tiempo: nuevoTiempo.toLowerCase().trim(),
            id_producto: producto.id_producto,
            idProducto: producto.id_producto,
            cantidad: Number(producto.cantidad) * cantidadNumerica
          };

          const response = await fetch(
            `${API_BASE_URL}/api/cliente/${idClienteLogueado}/registro`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datosRegistro)
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            Alert.alert(
              'Error',
              errorData?.mensaje || 'No se pudo registrar uno de los productos de la receta.'
            );
            return;
          }
        }

        Alert.alert('¡Éxito!', 'Receta registrada como productos individuales.');
      } else {
        const idProducto = alimentoSeleccionado.id_producto || alimentoSeleccionado.id;

        const datosRegistro = {
          id_cliente: idClienteLogueado,
          idCliente: idClienteLogueado,
          fecha: fechaSeleccionadaStr,
          tiempo: nuevoTiempo.toLowerCase().trim(),
          id_producto: idProducto,
          idProducto: idProducto,
          cantidad: cantidadNumerica
        };

        const response = await fetch(
          `${API_BASE_URL}/api/cliente/${idClienteLogueado}/registro`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosRegistro)
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          Alert.alert(
            'Error',
            errorData?.mensaje || 'No se pudo registrar la comida en el servidor.'
          );
          return;
        }

        Alert.alert('¡Éxito!', 'Alimento registrado correctamente en NutriTEC.');
      }

      setFiltroAlimento('');
      setAlimentoSeleccionado(null);
      setPorcionComida('1');

      await cargarConsumoDiarioAPI();
    } catch (err) {
      console.log('Error al sincronizar con el backend:', err);
      Alert.alert('Error de conexión', 'No hay respuesta del servidor local.');
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de NutriTEC?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: () => navigation.replace('Login')
        }
      ]
    );
  };

  useEffect(() => {
    setComidasAsignadas([]);
    setCaloriasTotales(0);
    setFiltroAlimento('');
    setAlimentoSeleccionado(null);
    cargarConsumoDiarioAPI();
  }, [fechaPivote, idClienteLogueado]);

  useEffect(() => {
    const comidasDelDia = comidasAsignadas.filter(c => c.fecha === fechaSeleccionadaStr);
    const sumaCalorias = comidasDelDia.reduce((acc, curr) => acc + curr.calorias, 0);
    setCaloriasTotales(sumaCalorias);
  }, [fechaSeleccionadaStr, comidasAsignadas]);

  const navegarSemana = (distancia: number) => {
    const nuevaFecha = new Date(fechaPivote);
    nuevaFecha.setDate(nuevaFecha.getDate() + distancia); 
    setFechaPivote(nuevaFecha);
  };
  
  const comidasFiltradasDia = comidasAsignadas.filter(c => c.fecha === fechaSeleccionadaStr);

  const sugerenciasProductos = filtroAlimento.trim() === '' ? [] : [
    ...listaProductos
      .filter(prod => {
        const termino = filtroAlimento.toLowerCase();
        return (
          prod.nombre?.toLowerCase().includes(termino) ||
          prod.descripcion?.toLowerCase().includes(termino) ||
          prod.codigoBarras?.toString().includes(termino)
        );
      })
      .map(prod => ({ ...prod, tipo: 'producto' })),

    ...listaRecetas
      .filter(receta =>
        receta.nombre?.toLowerCase().includes(filtroAlimento.toLowerCase())
      )
      .map(receta => ({ ...receta, tipo: 'receta' }))
  ];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFF' }, Platform.OS === 'android' && { paddingTop: 40 }]}>
      <View style={styles.container}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ECEFF1' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50' }}></Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#F39C12', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}
              onPress={() => navigation.navigate('GestionRecetas', { idCliente: idClienteLogueado })}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 11 }}>🍳 Recetas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={{ backgroundColor: '#E74C3C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }} 
            onPress={handleCerrarSesion}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Encabezado Mes / Año */}
          <View style={styles.headerRow}>
            <Text style={styles.meshTitle}>
              {nombresMeses[diasDeEstaSemana[0].getMonth()]} {diasDeEstaSemana[0].getFullYear()}
            </Text>
            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navegarSemana(-7)}>
                <Text style={styles.navBtnText}>&lt; Ant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navegarSemana(7)}>
                <Text style={styles.navBtnText}>Sig &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fila de Días Calendario */}
          <View style={styles.weekBar}>
            {diasDeEstaSemana.map((objetoFecha, idx) => {
              const numDia = objetoFecha.getDate();
              const fechaString = formatearFechaISO(objetoFecha);
              const esActivo = fechaString === fechaSeleccionadaStr;

              return (
                <TouchableOpacity 
                  key={fechaString} 
                  style={[styles.dayCard, esActivo && styles.activeDayCard]}
                  onPress={() => setFechaSeleccionadaStr(fechaString)}
                >
                  <Text style={[styles.dayName, esActivo && styles.activeDayName]}>
                    {diasSemanaLetras[idx]}
                  </Text>
                  <Text style={[styles.dayNum, esActivo && styles.activeDayNum]}>
                    {numDia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Suma Calórico */}
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieText}>🔥 {caloriasTotales} / 2000 kcal</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min((caloriasTotales / 2000) * 100, 100)}%` }]} />
            </View>
          </View>

          {/* Form para agregar comida */}
          <View style={{ backgroundColor: '#F8F9F9', padding: 15, borderRadius: 10, marginVertical: 15, borderWidth: 1, borderColor: '#E5E8E8', zIndex: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#34495E', marginBottom: 10 }}>✨ Registrar Alimento</Text>
         
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {opcionesTiempos.map((tiempo) => (
                <TouchableOpacity 
                  key={tiempo.value}
                  onPress={() => setNuevoTiempo(tiempo.value)}
                  style={{ 
                    paddingHorizontal: 12, 
                    paddingVertical: 7, 
                    borderRadius: 15, 
                    backgroundColor: nuevoTiempo === tiempo.value ? '#1ABC9C' : '#E5E8E8',
                    marginBottom: 2
                  }}
                >
                  <Text style={{ color: nuevoTiempo === tiempo.value ? '#FFF' : '#7F8C8D', fontSize: 11, fontWeight: 'bold' }}>
                    {tiempo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buscador de Alimentos  */}
            <View style={{ position: 'relative', marginBottom: 8 }}>
              <TextInput 
                style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#BDC3C7', color: '#333' }}
                placeholder="Buscar producto por nombre o código..."
                placeholderTextColor="#95A5A6"
                value={filtroAlimento}
                onChangeText={(texto) => {
                  setFiltroAlimento(texto);
                  if (alimentoSeleccionado) setAlimentoSeleccionado(null);
                }}
              />

              {/* Lista de Recomendaciones de productos*/}
              {sugerenciasProductos.length > 0 && (
                <View style={{ backgroundColor: '#FFF', borderColor: '#BDC3C7', borderWidth: 1, borderRadius: 6, marginTop: 4, maxHeight: 150, overflow: 'scroll' }}>
                  {sugerenciasProductos.map((prod: any) => {
                    const esReceta = prod.tipo === 'receta';

                    const nombreProd = esReceta
                      ? prod.nombre || ''
                      : prod.descripcion || prod.nombre || '';

                    const keyItem = esReceta
                      ? `receta-${prod.id_receta || prod.id}`
                      : `producto-${prod.id_producto || prod.id}`;

                    return (
                      <TouchableOpacity
                        key={keyItem}
                        style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ECF0F1' }}
                        onPress={() => {
                          setAlimentoSeleccionado(prod);
                          setFiltroAlimento(nombreProd);
                        }}
                      >
                        <Text style={{ color: '#2C3E50', fontWeight: '500' }}>
                          {nombreProd}
                        </Text>

                        <Text style={{ color: '#7F8C8D', fontSize: 11 }}>
                          {esReceta ? '🍽 Receta' : `🔥 ${prod.energia} kcal`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput 
                style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#BDC3C7', flex: 1, marginRight: 10, color: '#333' }}
                placeholder="Porción / Cantidad"
                placeholderTextColor="#95A5A6"
                keyboardType="numeric"
                value={porcionComida}
                onChangeText={setPorcionComida}
              />
              <TouchableOpacity 
                style={{ backgroundColor: '#2ECC71', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 }}
                onPress={handleInsertarComida}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Comidas Registradas */}
          <Text style={styles.sectionTitle}>Comidas del Día</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#1ABC9C" style={{ marginVertical: 20 }} />
          ) : comidasFiltradasDia.length === 0 ? (
            <Text style={styles.emptyText}>No hay alimentos registrados para este día.</Text>
          ) : (
            comidasFiltradasDia.map((comida, index) => (
              <View key={index} style={styles.comidaCard}>
                <View style={styles.comidaInfo}>
                  <Text style={styles.comidaTiempo}>{comida.tiempo}</Text>
                  <Text style={styles.comidaDetalle}>{comida.detalle}</Text>
                </View>
                <Text style={styles.comidaCal}>{comida.calorias} kcal</Text>
              </View>
            ))
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}