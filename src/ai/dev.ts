import { config } from 'dotenv';
config();

import '@/ai/flows/predict-ruc-expiry.ts';
import '@/ai/flows/extract-data-from-compliance-document.ts';