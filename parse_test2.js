const row = "8/1\t\t\t\t\t\t\t\t\t\tBAEK SEUNGHYUK\t3\t3\t\t스마트스토어\t\"\t백승혁\"\t8/1 shark+malum 07:30\t\t\t\t\t\t\t\t\t\t\t\t\td2ba37eb-dac1-4d7d-9617-b9c77ef58330\t\t".split('\t');

const remarkRaw = (row[16] || '').trim();
console.log("remarkRaw:", remarkRaw);

let allItems = [];

remarkRaw.split('\n').forEach(line => {
    const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
    if (dm) {
        let itemName = line.replace(dm[0], '').trim();
        const lowerLine = line.toLowerCase();
        
        const hasWhaleKeyword = lowerLine.includes('shark') || lowerLine.includes('고래');
        const hasMalumKeyword = lowerLine.includes('malum') || lowerLine.includes('말룸');
        
        if (lowerLine.includes('고말팩') || (hasWhaleKeyword && hasMalumKeyword)) { itemName = '고말팩(고래상어+말룸파티)';  }
        else if (hasMalumKeyword) { itemName = '시크릿가든 말룸파티'; }
        else if (hasWhaleKeyword) { itemName = '리버타드 고래상어'; }
        
        console.log("itemName:", itemName);
    } else {
        console.log("No dm match");
    }
});
