import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import fs from 'fs';

// Read config from main.js or firebase config file if possible
