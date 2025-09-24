import NetInfo, {
  NetInfoState,
  NetInfoStateType,
  NetInfoSubscription,
} from '@react-native-community/netinfo';

export const connectionService = {
  isConnected: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    //return false; //SIMULATE OFFLINE
    return state.isInternetReachable ?? false;
  },

  // Obtient le type de connexion (wifi, cellular, etc.)
  getConnectionType: async (): Promise<NetInfoStateType> => {
    const state = await NetInfo.fetch();
    return state.type;
  },

  // Détails complets de l'état de la connexion
  getConnectionDetails: async (): Promise<NetInfoState> => {
    return await NetInfo.fetch();
  },

  // S'abonner aux changements de connexion
  subscribe: (callback: (state: NetInfoState) => void): NetInfoSubscription => {
    return NetInfo.addEventListener(callback);
  },

  // Se désabonner des changements de connexion
  unsubscribe: (subscription: NetInfoSubscription): void => {
    subscription();
  },

  // Vérifie si la connexion est considérée comme lente (2G ou 3G)
  isSlowConnection: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    if (state.type === 'cellular' && state.details) {
      const generation = (state.details as { cellularGeneration: string })
        ?.cellularGeneration;
      return generation === '2g' || generation === '3g';
    }
    return false;
  },

  // Vérifie si la connexion est assez bonne pour le streaming
  isGoodForStreaming: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return false;
    
    if (state.type === 'wifi') return true;
    
    if (state.type === 'cellular' && state.details) {
      const generation = (state.details as { cellularGeneration: string })
        ?.cellularGeneration;
      return generation === '4g' || generation === '5g';
    }
    
    return false;
  },
};