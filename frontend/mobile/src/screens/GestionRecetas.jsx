import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";

const API_BASE_URL = "https://nutritec-api-dkgtbsfbgceue7cm.westus3-01.azurewebsites.net";

function GestionRecetas({ navigation }) {
  const [idCliente, setIdCliente] = useState("4");
  const [nombreReceta, setNombreReceta] = useState("");

  const [productosAprobados, setProductosAprobados] = useState([]);
  const [recetas, setRecetas] = useState([]);

  const [filtroProducto, setFiltroProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("1");
  const [productosReceta, setProductosReceta] = useState([]);

  useEffect(() => {
    cargarProductosAprobados();
  }, []);

  const cargarProductosAprobados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/producto/aprobados`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setProductosAprobados(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los productos aprobados.");
    }
  };

  const buscarRecetasPorCliente = async () => {
    if (!idCliente.trim()) {
      Alert.alert("Error", "Ingrese el ID del cliente.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/receta/cliente/${idCliente}`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setRecetas(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar las recetas.");
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      Alert.alert("Error", "Seleccione un producto aprobado.");
      return;
    }

    const yaExiste = productosReceta.some(
      (p) => p.id_producto === productoSeleccionado.id_producto
    );

    if (yaExiste) {
      Alert.alert("Aviso", "Ese producto ya está en la receta.");
      return;
    }

    setProductosReceta([
      ...productosReceta,
      {
        ...productoSeleccionado,
        cantidad: Number(cantidad)
      }
    ]);

    setFiltroProducto("");
    setProductoSeleccionado(null);
    setCantidad("1");
  };

  const quitarProducto = (idProducto) => {
    setProductosReceta(
      productosReceta.filter((p) => p.id_producto !== idProducto)
    );
  };

  const calcularTotales = () => {
    return productosReceta.reduce(
      (total, producto) => {
        total.energia += Number(producto.energia) * Number(producto.cantidad);
        total.proteina += Number(producto.proteina) * Number(producto.cantidad);
        total.carbohidratos +=
          Number(producto.carbohidratos) * Number(producto.cantidad);
        total.grasa += Number(producto.grasa) * Number(producto.cantidad);

        return total;
      },
      {
        energia: 0,
        proteina: 0,
        carbohidratos: 0,
        grasa: 0
      }
    );
  };

  const crearReceta = async () => {
    if (!idCliente.trim()) {
      Alert.alert("Error", "Ingrese el ID del cliente.");
      return;
    }

    if (!nombreReceta.trim()) {
      Alert.alert("Error", "Ingrese el nombre de la receta.");
      return;
    }

    if (productosReceta.length === 0) {
      Alert.alert("Error", "Agregue al menos un producto.");
      return;
    }

    const receta = {
      id_cliente: Number(idCliente),
      nombre: nombreReceta,
      productos: productosReceta.map((producto) => ({
        id_producto: producto.id_producto,
        cantidad: producto.cantidad
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/receta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(receta)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.mensaje || "No se pudo crear la receta.");
      }

      Alert.alert("Éxito", "Receta creada correctamente.");

      setNombreReceta("");
      setProductosReceta([]);
      setFiltroProducto("");
      setProductoSeleccionado(null);
      setCantidad("1");

      buscarRecetasPorCliente();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const eliminarReceta = async (idReceta) => {
    Alert.alert(
      "Eliminar receta",
      "¿Desea eliminar esta receta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/receta/${idReceta}`,
                {
                  method: "DELETE"
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.mensaje || "No se pudo eliminar la receta.");
              }

              Alert.alert("Éxito", "Receta eliminada correctamente.");
              buscarRecetasPorCliente();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Error al eliminar receta."
              );
            }
          }
        }
      ]
    );
  };

  const productosFiltrados =
    filtroProducto.trim() === ""
      ? []
      : productosAprobados.filter((producto) => {
          const texto = filtroProducto.toLowerCase();
          const descripcion = producto.descripcion?.toLowerCase() || "";
          const codigo = producto.codigo?.toLowerCase() || "";

          return descripcion.includes(texto) || codigo.includes(texto);
        });

  const totales = calcularTotales();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gestión de Recetas</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Buscar recetas por cliente</Text>

        <Text style={styles.label}>ID del cliente</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={idCliente}
          onChangeText={setIdCliente}
          placeholder="Ej: 4"
          placeholderTextColor="#95A5A6"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={buscarRecetasPorCliente}>
          <Text style={styles.buttonText}>Buscar recetas</Text>
        </TouchableOpacity>

        {recetas.length === 0 ? (
          <Text style={styles.emptyText}>No hay recetas cargadas.</Text>
        ) : (
          recetas.map((receta) => (
            <View key={receta.id_receta} style={styles.listItem}>
              <View style={styles.recipeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{receta.nombre}</Text>
                  <Text style={styles.itemSubtitle}>ID receta: {receta.id_receta}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteSmallButton}
                  onPress={() => eliminarReceta(receta.id_receta)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Crear receta</Text>

        <Text style={styles.label}>Nombre de la receta</Text>
        <TextInput
          style={styles.input}
          value={nombreReceta}
          onChangeText={setNombreReceta}
          placeholder="Ej: Pinto saludable"
          placeholderTextColor="#95A5A6"
        />

        <Text style={styles.label}>Buscar producto aprobado</Text>
        <TextInput
          style={styles.input}
          value={filtroProducto}
          onChangeText={(texto) => {
            setFiltroProducto(texto);
            setProductoSeleccionado(null);
          }}
          placeholder="Nombre o código"
          placeholderTextColor="#95A5A6"
        />

        {productosFiltrados.map((producto) => (
          <TouchableOpacity
            key={producto.id_producto}
            style={[
              styles.productOption,
              productoSeleccionado?.id_producto === producto.id_producto &&
                styles.productSelected
            ]}
            onPress={() => {
              setProductoSeleccionado(producto);
              setFiltroProducto(producto.descripcion);
            }}
          >
            <Text style={styles.productName}>{producto.descripcion}</Text>
            <Text style={styles.itemSubtitle}>
              {producto.energia} kcal | {producto.proteina} g proteína
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="Ej: 1"
          placeholderTextColor="#95A5A6"
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={agregarProducto}>
          <Text style={styles.buttonText}>Agregar producto</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Productos en receta</Text>

        {productosReceta.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos agregados.</Text>
        ) : (
          productosReceta.map((producto) => (
            <View key={producto.id_producto} style={styles.recipeProduct}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{producto.descripcion}</Text>
                <Text style={styles.itemSubtitle}>
                  Cantidad: {producto.cantidad} | {producto.energia * producto.cantidad} kcal
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => quitarProducto(producto.id_producto)}
              >
                <Text style={styles.deleteText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.totalBox}>
          <Text style={styles.totalTitle}>Totales</Text>
          <Text>Calorías: {totales.energia} kcal</Text>
          <Text>Proteína: {totales.proteina} g</Text>
          <Text>Carbohidratos: {totales.carbohidratos} g</Text>
          <Text>Grasa: {totales.grasa} g</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={crearReceta}>
          <Text style={styles.buttonText}>Guardar receta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F7"
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center"
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E8E8"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12
  },
  label: {
    fontWeight: "bold",
    color: "#34495E",
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 8,
    padding: 12,
    color: "#2C3E50",
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: "#1ABC9C",
    padding: 14,
    borderRadius: 8,
    marginTop: 10
  },
  secondaryButton: {
    backgroundColor: "#3498DB",
    padding: 14,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold"
  },
  emptyText: {
    color: "#7F8C8D",
    marginTop: 12,
    textAlign: "center"
  },
  listItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9F9",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ECF0F1"
  },
  itemTitle: {
    fontWeight: "bold",
    color: "#2C3E50"
  },
  itemSubtitle: {
    color: "#7F8C8D",
    fontSize: 12,
    marginTop: 2
  },
  productOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#FFF"
  },
  productSelected: {
    borderColor: "#1ABC9C",
    backgroundColor: "#E8F8F5"
  },
  productName: {
    fontWeight: "bold",
    color: "#2C3E50"
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 18,
    marginBottom: 8
  },
  recipeProduct: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8F9F9",
    marginBottom: 8
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteText: {
    color: "#FFF",
    fontWeight: "bold"
  },
  totalBox: {
    backgroundColor: "#E8F8F5",
    padding: 14,
    borderRadius: 10,
    marginTop: 14
  },
  totalTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#16A085"
  },
  backButton: {
    backgroundColor: "#7F8C8D",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "flex-start"
  },

  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  },

  recipeRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  deleteSmallButton: {
    backgroundColor: "#E74C3C",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
});

export default GestionRecetas;