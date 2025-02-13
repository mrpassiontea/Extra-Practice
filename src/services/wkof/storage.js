import { DB_ERRORS, DB_VALUES } from "../../constants/index";

// Assumption: User has wkof.file_cache for the IndexedDB operations to work

export async function getCurrentUserLevel() {    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_VALUES.DB_NAME, 1);
        
        request.onsuccess = (event) => {
            
            const db = event.target.result;
            const transaction = db.transaction([DB_VALUES.FILE_STORE], "readonly");
            const store = transaction.objectStore(DB_VALUES.FILE_STORE);
            const getUser = store.get(DB_VALUES.USER_RECORD);
            
            getUser.onsuccess = () => {
                const userData = getUser.result;
                resolve(userData.content.data.level);
            };
            
            getUser.onerror = () => {
                reject(handleError("USER_LEVEL"));
            };
        };
        
        request.onerror = () => {
            reject(handleError("OPEN"));
        };
    });
}

export async function getCurrentLevelRadicals() {
    try {
        const userLevel = await getCurrentUserLevel();
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_VALUES.DB_NAME, 1);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([DB_VALUES.FILE_STORE], "readonly");
                const store = transaction.objectStore(DB_VALUES.FILE_STORE);
                const getSubjects = store.get(DB_VALUES.SUBJECT_RECORD);
                
                getSubjects.onsuccess = () => {
                    const subjectsData = getSubjects.result;
                    
                    const currentLevelRadicals = Object.values(subjectsData.content.data)
                        .filter(subject => 
                            subject.object === "radical" && 
                            subject.data.level === userLevel
                        )
                        .map(radical => ({
                            id: radical.id,
                            character: radical.data.characters,
                            meaning: radical.data.meanings[0].meaning,
                            documentationUrl: radical.data.document_url,
                            meaningMnemonic: radical.data.meaning_mnemonic,
                            svg: radical.data.character_images.find(img => 
                                img.content_type === "image/svg+xml"
                            )?.url || null
                        }));
                    
                    resolve(currentLevelRadicals);
                };
                
                getSubjects.onerror = () => {
                    reject(handleError("SUBJECT_DATA"));
                };
            };
            
            request.onerror = () => {
                reject(handleError("OPEN"));
            };
        });
    } catch (error) {
        console.error("Error in getCurrentLevelRadicals:", error);
        throw error;
    }
}

export async function getCurrentLevelKanji() {
    return new Promise(async (resolve, reject) => {
        const userLevel = await getCurrentUserLevel();

        const request = indexedDB.open('wkof.file_cache', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            
            Promise.all([
                new Promise(resolve => {
                    store.get('Apiv2.assignments').onsuccess = (e) => 
                        resolve(e.target.result.content.data);
                }),
                new Promise(resolve => {
                    store.get('Apiv2.subjects').onsuccess = (e) => 
                        resolve(e.target.result.content.data);
                })
            ]).then(([assignments, subjects]) => {
                const unlockedKanjiIds = new Set(
                    Object.values(assignments)
                        .filter(a => a.data.subject_type === "kanji")
                        .map(a => a.data.subject_id)
                );

                // Helper function to get radical information
                const getRadicalInfo = (radicalId) => {
                    const radical = subjects[radicalId];
                    if (!radical) return null;
                    
                    return {
                        id: radical.id,
                        character: radical.data.characters,
                        meaning: radical.data.meanings[0].meaning,
                        svg: radical.data.character_images?.find(img => 
                            img.content_type === 'image/svg+xml'
                        )?.url || null
                    };
                };
                
                const currentLevelKanji = Object.values(subjects)
                    .filter(subject => 
                        subject.object === "kanji" && 
                        subject.data.level === userLevel &&
                        unlockedKanjiIds.has(subject.id)
                    )
                    .map(kanji => ({
                        id: kanji.id,
                        character: kanji.data.characters,
                        meanings: kanji.data.meanings.filter(m => m.accepted_answer),
                        readings: kanji.data.readings.filter(r => r.accepted_answer),
                        meaningMnemonic: kanji.data.meaning_mnemonic,
                        meaningHint: kanji.data.meaning_hint,
                        readingMnemonic: kanji.data.reading_mnemonic,
                        readingHint: kanji.data.reading_hint,
                        documentUrl: kanji.data.document_url,
                        radicals: kanji.data.component_subject_ids
                            .map(getRadicalInfo)
                            .filter(Boolean)
                    }));
                
                resolve(currentLevelKanji);
            });
        };

        request.onerror = (error) => reject(error);
    });
}

function handleError(type) {
    if (type == "OPEN") {
        return new Error(DB_ERRORS.OPEN);
    }

    if (type == "USER_LEVEL") {
        return new Error(DB_ERRORS.USER_LEVEL);
    }

    if (type == "SUBJECT_DATA") {
        return new Error(DB_ERRORS.SUBJECT_DATA);
    }
}