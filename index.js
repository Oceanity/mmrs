const fs = require("fs"),
    zip = require("adm-zip"),
    zseqRegex = /(.+)_([0-9a-f]{1,2})_((?:\d+[,-]?)+)\.zseq/i;

// Check Args
let args = process.argv.slice(2),
    zseqFile = null;
    addFiles = [];
if (args.length) {
    function CheckArg() {
        const val = args.shift();
        fs.stat(val, (err, stats) => {
            // If File exists, process
            if (!err) {
                // If ZSeq, label as such, otherwise push to additional files
                if (zseqRegex.test(val)) {
                    zseqFile = val;
                } else addFiles.push(val);
            }
            // If there are still args, check more
            if (args.length) {
                CheckArg();
            } else ProcessZip();
        });
    } CheckArg();

    function ProcessZip() {
        if (zseqFile) {
            fs.readFile(zseqFile, (err, data) => {
                if (err) {
                    console.error("Error reading ZSEQ file!");
                } else {
                    const matches = zseqRegex.exec(zseqFile),
                    mmrsFile = new zip();
                    // If Valid
                    if (matches) {
                        const name = matches[1],
                            bank = matches[2],
                            cats = matches[3],
                            catsBuff = Buffer.from(cats, "utf8"),
                            mmrsPath = `${name}.mmrs`;
                        mmrsFile.addFile(`${bank}.zseq`, data);
                        mmrsFile.addFile("categories.txt", catsBuff);
                        for (let file of addFiles) {
                            mmrsFile.addLocalFile(file);
                        }
                        try {
                            mmrsFile.writeZip(mmrsPath);
                            console.log(`Wrote file to "${mmrsPath.replace(/\\+/g, "\\")}" successfully!`)
                        } catch {
                            console.error(`Could not write MMRS file to disk, is "${mmrsPath.replace(/\\+/g, "\\")}" open in another process?`);
                        }
                    }
                    // Else
                    else {
                        console.error("ZSEQ file name is invalid! Use proper naming scheme (name_bank_categories)!");
                    }
                }
            });
        }
        else {
            console.error("No ZSEQ provided in arguments!");
        }    
    }
}

else {
    console.error("No ZSEQ provided in arguments!");
}
