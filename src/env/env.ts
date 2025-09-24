import { NativeModules } from "react-native";

interface EnvironmentConfig {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
}

const config = {
    dev: {
        SUPABASE_URL: 'https://nlilxegaylysxvxwvzdo.supabase.co',
        SUPABASE_KEY: 'sb_publishable_LG2umdNT9YGuKGYjUf9tyA_9Z_2MmMt'
    },
    prod: {
        SUPABASE_URL: 'https://uilferoebypuzqxsyyoj.supabase.co',
        SUPABASE_KEY: 'sb_publishable_kHECr6hTfULeEjR5eBGznw_Qe2Id52h'
    }
};

// Méthode plus fiable pour détecter l'environnement
const getEnv = () => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%: __DEV__:", __DEV__);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%: NativeModules:", NativeModules);
    
    
    if (__DEV__) return config.dev;
    console.log("Running in production mode");


    // Pour les builds Android
    if (typeof NativeModules !== 'undefined' && NativeModules.AndroidConstants) {
        return config.prod;
    }

    // Pour les builds iOS ou fallback
    return config.prod;
};

export default getEnv();