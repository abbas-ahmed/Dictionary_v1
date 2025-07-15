 const { createApp } = Vue;
        
        createApp({
            data() {
                return {
                    DataCsv :[] ,
                    availableFiles: [
                        'Words_3000_in_English.csv', 
                        'Verb_3000_in_English.csv',
                        'Adjectivs_3000_in_English.csv'
                        // Add more files as needed
                    ],
                    selectedFile: null,
                    fileContent: null,
                    fileHandle: null,
                    words: [],
                    verbs: [],
                    adjectvs: [],
                    type : 0 ,
                    currentIndex: 0,
                    loading: false,
                    error: null , 
                    pathfile : null 
                }
            },
            computed: {
                currentWord() {
                    return this.words[this.currentIndex] || {};
                },
                currentVerbs() {
                    return this.verbs[this.currentIndex] || {};
                },
                currentAdjectvs() {
                    return this.adjectvs[this.currentIndex] || {};
                }
            },
            methods: {
                // Method to trigger file selection
                selectFile() {
                    document.getElementById('fileInput').click();
                },
                
                // Handle file selection
                handleFileSelection(event) {
                    const file = event.target.files[0];
                    if (file) {
                        this.selectedFile = file.name;
                        this.fileContent = file;
                    }
                },
                
                // Load the selected file
                loadFile() {
                    if (!this.fileContent) return;
                    
                    this.loading = true;
                    this.error = null;
                    
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        try {
                            this.parseCSV(e.target.result);
                        } catch (err) {
                            this.error = `Error parsing CSV: ${err.message}`;
                        } finally {
                            this.loading = false;
                        }
                    };
                    
                    reader.onerror = () => {
                        this.error = "Error reading file";
                        this.loading = false;
                    };
                    
                    reader.readAsText(this.fileContent);
                },
                
                // Load a file from static directory
                async loadStaticFile(filename) {
                    this.type = this.availableFiles.indexOf(filename) ;
                    this.loading = true;
                    this.error = null;
                    
                    try {
                        // In a real app, this would be the path to your static files
                        // For example: `/static/vocabulary/${filename}`
                        const response = await fetch(`static/${filename}`);
                        this.pathfile = response ; 
                        
                        if (!response.ok) {
                            throw new Error(`Failed to load file: ${response.statusText}`);
                        }
                        
                        const csvText = await response.text();

                        if (this.type == 0) { this.parseCSV(csvText);}
                        if (this.type == 1) { this.verbsCSV(csvText);} 
                        if (this.type == 2) { this.adjectvsCSV(csvText);  }
                       
                        
                    } catch (err) {
                        this.error = `Error loading file: ${err.message}`;
                    } finally {
                        this.loading = false;
                    }
                },
                
                // Parse CSV content
                parseCSV(csvText) {
                    const results = Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        transformHeader: header => header.trim().toLowerCase()
                    });
                    
                    if (results.errors.length > 0) {
                        throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join('; ')}`);
                    }
                    
                    // Validate required columns
                    const requiredColumns = ['words', 'mean'];
                    const firstRow = results.data[0] || {};
                    
                    const missingColumns = requiredColumns.filter(
                        col => !Object.keys(firstRow).includes(col)
                    );
                    
                    if (missingColumns.length > 0) {
                        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
                    }
                    
                    // Process and store the data
                    this.words = results.data.map(row => ({
                        words: row.words || '',
                        mean: row.mean || '',
                        sentence: row.sentence || '',
                        translation: row.translation || ''
                    }));
                    
                    this.currentIndex = 0;
                },
                
                verbsCSV(csvText) {
                    const results = Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        transformHeader: header => header.trim().toLowerCase()
                    });
                    this.DataCsv = results ;
                    
                    if (results.errors.length > 0) {
                        throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join('; ')}`);
                    }
                    
                    // Validate required columns
                    
                    const requiredColumns = ['vrebs_en','vreb_ar','words1','mean1','mean2','mean3','mean4','mean_ar_1','mean_ar_2','mean_ar_3','mean_ar_4','id','stats'];
                    const firstRow = results.data[0] || {};
                    
                    const missingColumns = requiredColumns.filter(
                        col => !Object.keys(firstRow).includes(col)
                    );
                    
                    if (missingColumns.length > 0) {
                        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
                    }
                    
                  // Process and store the data
                  this.verbs = results.data.map(row => ({
                        vrebs_en: row.vrebs_en || '',
                        vreb_ar: row.vreb_ar || '',
                        words1: row.words1 || '',
                        mean1: row.mean1 || '',
                        mean2: row.mean2 || '',
                        mean3: row.mean3 || '',
                        mean4: row.mean4 || '',
                        mean_ar_1: row.mean_ar_1 || '',
                        mean_ar_2: row.mean_ar_2 || '',
                        mean_ar_3: row.mean_ar_3 || '',
                        mean_ar_4: row.mean_ar_4 || '',
                        id: row.id || '',
                        stats: row.stats || '',
                    }));
                    
                    this.currentIndex = 0;
                },
                
                // adjectvs files csv content
                adjectvsCSV(csvText) {
                    const results = Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        transformHeader: header => header.trim().toLowerCase()
                    });
                    this.DataCsv = results.data;
                    this.headers = results.meta.fields || [];

                    if (this.DataCsv.length > 0 && this.headers.length === 0) {
                                    // If no headers, create default column names
                                    this.headers = Object.keys(this.data[0]).map((_, i) => `Column ${i + 1}`);
                                }
                    
                    if (results.errors.length > 0) {
                        throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join('; ')}`);
                    }
                    
                    // Validate required columns
                    		
                    const requiredColumns = ['words_en','meaning_words_en','statment_words_en','meaning_words_ar','statment_words_ar','words_ar','id','stat'];
                    const firstRow = results.data[0] || {};
                    
                    const missingColumns = requiredColumns.filter(
                        col => !Object.keys(firstRow).includes(col)
                    );
                    
                    if (missingColumns.length > 0) {
                        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
                    }
                    
                  // Process and store the data
                  this.adjectvs = results.data.map(row => ({
                    words_en: row.words_en || '',
                    meaning_words_en: row.meaning_words_en || '',
                    statment_words_en: row.statment_words_en || '',
                    meaning_words_ar: row.meaning_words_ar || '',
                    statment_words_ar: row.statment_words_ar || '',
                    words_ar: row.words_ar || '',
                    id: row.id || '',
                    stat: row.stat || '',
                    }));
                    
                    this.currentIndex = 0;
                },
                 
                // Navigation methods
                nextWord() {
                    if ( (this.currentIndex < 59  )  ) {
                        this.currentIndex++;
                    } else {
                        this.currentIndex = 0;
                    }
                },
                
                prevWord() {
                    if (this.currentIndex >0) {
                        this.currentIndex--;
                    } else {
                        this.currentIndex = 60 ; //this.words.length - 1;
                    }
                } , 
                 // updata csv 
                async updataCellEdit( index_ , id_ , value_ ) {
                    // change the cell value in list  
                    this.DataCsv[this.currentIndex]['stat'] = value_ ;
                     [fileHandle] = await window.showOpenFilePicker({
                            types: [this.pathfile]
                        });
                    try {
                        const csv = this.generateCSV();
                        
                        const writable =  await this.fileHandle.createWritable();
                        await writable.write(csv);
                        await writable.close();
                        alert('Changes saved successfully!');
                    } catch (error) {
                        alert('Error saving file: ' + error.message, 'danger');
                    }

                    alert( this.currentIndex) ;
                    alert( nx) ;

                    
                    },
                generateCSV() {
                    return Papa.unparse({
                        fields: this.headers,
                        data: this.DataCsv
                    }, {
                        header: true,
                        skipEmptyLines: true
                    });
                },    

            
                markKnown() {
                    
                        alert(`"${this.adjectvs[this.currentIndex]['stat']}" marked as known!`);
                        alert(`"${ this.DataCsv[this.currentIndex]['stat']}" marked as known!`);
                      

                    
                },
                markReview() {
                    if (!this.reviewWords.includes(this.currentIndex)) {
                        this.reviewWords.push(this.currentIndex);
                        alert(`"${this.currentWord}" added to review list!`);
                    }
                },
                resetProgress() {
                    this.indexword = 0;
                    this.knownWords = [];
                    this.reviewWords = [];
                } 
                // end place updata csv 
                 },
                
                    
            
            mounted() {
                // Load a default file when the app starts
                this.loadStaticFile('vocabulary.csv');
            }
        }).mount('#app');



         var app = new  Vue({
            delimiters:["[[","]]"] ,
            el:'#app' , 
            data: {
                    items: data  , // Inject the parsed data into Vue ,
                    vue_div : 'Hallo in vue div' ,
                },
        });
    