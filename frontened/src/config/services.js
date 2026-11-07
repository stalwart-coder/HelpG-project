// Adding a new service in future = add one object here. No component changes needed.
export const SERVICES = [
  {
    id: 'iron',
    icon: '👕',
    labelKey: 'catIron',
    descKey: 'catIronDesc',
    tag: { bg: 'bg-blue-50', text: 'text-blue-800' },
  },
  {
    id: 'vehicle',
    icon: '🚗',
    labelKey: 'catVehicle',
    descKey: 'catVehicleDesc',
    tag: { bg: 'bg-emerald-50', text: 'text-banyan' },
  },
  {
    id: 'guard',
    icon: '🛡️',
    labelKey: 'catGuard',
    descKey: 'catGuardDesc',
    tag: { bg: 'bg-red-50', text: 'text-brick' },
  },
  {
    id: 'event',
    icon: '🍽️',
    labelKey: 'catEvent',
    descKey: 'catEventDesc',
    tag: { bg: 'bg-purple-50', text: 'text-purple-800' },
  },
];

export const SERVICE_LABELS = {
  en: { iron: 'Ironing & Wash', vehicle: 'Vehicle Wash', guard: 'Temporary Guard', event: 'Event Staff' },
  hi: { iron: 'इस्त्री और धुलाई', vehicle: 'वाहन धुलाई', guard: 'अस्थायी गार्ड', event: 'इवेंट स्टाफ' },
  mr: { iron: 'इस्त्री व धुलाई', vehicle: 'वाहन स्वच्छता', guard: 'तात्पुरता सुरक्षा रक्षक', event: 'इव्हेंट कर्मचारी' },
  es: { iron: 'Planchado y Lavado', vehicle: 'Lavado de Vehículos', guard: 'Guardia Temporal', event: 'Personal para Eventos' },
  ur: { iron: 'استری اور دھلائی', vehicle: 'گاڑی دھلائی', guard: 'عارضی گارڈ', event: 'ایونٹ اسٹاف' },
  pa: { iron: 'ਪ੍ਰੈਸ ਅਤੇ ਧੁਲਾਈ', vehicle: 'ਵਾਹਨ ਧੁਲਾਈ', guard: 'ਆਰਜ਼ੀ ਗਾਰਡ', event: 'ਈਵੈਂਟ ਸਟਾਫ਼' },
};

export const SERVICE_DESCS = {
  en: { iron: 'Press, machine wash', vehicle: 'Car, bike cleaning', guard: '1–2 day duty', event: 'Cook, cleaning crew' },
  hi: { iron: 'प्रेस, मशीन धुलाई', vehicle: 'कार, बाइक सफाई', guard: '1–2 दिन ड्यूटी', event: 'कुक, सफाई स्टाफ' },
  mr: { iron: 'इस्त्री, मशीन धुलाई', vehicle: 'कार, बाईक स्वच्छता', guard: '१-२ दिवस ड्युटी', event: 'आचारी, स्वच्छता कर्मचारी' },
  es: { iron: 'Planchado, lavado a máquina', vehicle: 'Limpieza de autos y motos', guard: 'Servicio de 1-2 días', event: 'Cocineros y personal de limpieza' },
  ur: { iron: 'استری، مشین دھلائی', vehicle: 'کار، بائیک صفائی', guard: '1–2 دن ڈیوٹی', event: 'باورچی، صفائی عملہ' },
  pa: { iron: 'ਪ੍ਰੈਸ, ਮਸ਼ੀਨ ਧੁਲਾਈ', vehicle: 'ਕਾਰ, ਬਾਈਕ ਸਫ਼ਾਈ', guard: '1–2 ਦਿਨ ਡਿਊਟੀ', event: 'ਕੁੱਕ, ਸਫ਼ਾਈ ਸਟਾਫ਼' },
};
