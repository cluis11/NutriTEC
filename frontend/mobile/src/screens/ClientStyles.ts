import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  // Encabezado del mes y botones 
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginVertical: 16,
  },
  meshTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navBtnText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 13,
  },
  // Barra de días de la semana
  weekBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: '13%',
  },
  activeDayCard: {
    backgroundColor: '#1ABC9C',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6C757D',
    textTransform: 'uppercase',
  },
  activeDayName: {
    color: '#FFFFFF',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  activeDayNum: {
    color: '#FFFFFF',
  },
  // Módulo de comidas y caloría tracker
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  calorieContainer: {
    backgroundColor: '#E8F8F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A085',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#D1F2EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1ABC9C',
  },
  // Lista de comidas diarias
  comidaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1ABC9C',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  comidaInfo: {
    flex: 1,
  },
  comidaTiempo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7F8C8D',
    textTransform: 'uppercase',
  },
  comidaDetalle: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginTop: 2,
  },
  comidaCal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A085',
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    marginVertical: 15,
  },
  // Botón de Recetas
  recipeButton: {
    backgroundColor: '#2C3E50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  recipeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});