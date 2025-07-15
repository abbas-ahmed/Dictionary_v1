 const { createApp } = Vue;
        
        createApp({
            data() {
                return {
                    DataCsv :[] ,
                    availableFiles: [
                        'my_vocabulary.csv', 
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
                    const requiredColumns = ['words_en', 'words_ar' , 'words_de','words_ru','words_sp','words_fr','words_ch','words_ir']; 
                    const firstRow = results.data[0] || {};
                    
                    const missingColumns = requiredColumns.filter(
                        col => !Object.keys(firstRow).includes(col)
                    );
                    
                    if (missingColumns.length > 0) {
                        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
                    }
                    
                    // Process and store the data
                    this.words = results.data.map(row => ({
                        words_en: row.words_en || '',
                        words_ar: row.words_ar || '',
                        words_de: row.words_de || '',
                        words_ru: row.words_ru || '',
                        words_sp: row.words_sp || '',
                        words_fr: row.words_fr || '',
                        words_ir: row.words_ir || '',
                        words_ch: row.words_ch || ''
                    
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
                this.loadStaticFile('static/my_vocabulary.csv');
            }
        }).mount('#app');



       
    