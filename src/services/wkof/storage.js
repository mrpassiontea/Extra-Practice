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