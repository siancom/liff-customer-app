import re

with open('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'r') as f:
    content = f.read()

# Replace duration logic
pattern = r"let eDate;.*?expireText = `หมดอายุใน \$\{diffDays\} วัน`;\s*return \{\s*\.\.\.c,\s*myHistories: courseHistories,\s*totalUsed: finalUsed,\s*remaining: remaining,\s*totalQty: currentTotal,\s*computedTotalCredit: initialCredit,\s*computedUsedCredit: finalBerqAmount,\s*computedRemainCredit: remainingCredit,\s*status: currentStatus,\s*diffDays: diffDays,\s*expireText: expireText\s*\};\s*\}\);"

replacement = """let eDate;
            let durationText = "1 ปี";

            if (expireDateStr) {
                const expStr = String(expireDateStr).trim().toLowerCase();
                if (expStr.includes('เดือน')) {
                    const months = parseInt(expStr.replace(/[^0-9]/g, '')) || 1;
                    eDate = new Date(pDate);
                    eDate.setMonth(eDate.getMonth() + months);
                    durationText = `${months} เดือน`;
                } else if (expStr.includes('ปี')) {
                    const years = parseInt(expStr.replace(/[^0-9]/g, '')) || 1;
                    eDate = new Date(pDate);
                    eDate.setFullYear(eDate.getFullYear() + years);
                    durationText = `${years} ปี`;
                } else if (expStr.includes('วัน') && !expStr.includes('/')) {
                    const days = parseInt(expStr.replace(/[^0-9]/g, '')) || 1;
                    eDate = new Date(pDate);
                    eDate.setDate(eDate.getDate() + days);
                    durationText = `${days} วัน`;
                } else {
                    eDate = parseThaiDate(expireDateStr);
                }
            }
            
            if (!eDate || (expireDateStr && eDate.getTime() <= pDate.getTime())) {
                eDate = new Date(pDate);
                if (currentTotal === 1) {
                    eDate.setDate(eDate.getDate() + 7);
                    durationText = "7 วัน";
                } else if (currentTotal === 2) {
                    eDate.setMonth(eDate.getMonth() + 1);
                    durationText = "1 เดือน";
                } else if (currentTotal >= 3 && currentTotal <= 5) {
                    eDate.setMonth(eDate.getMonth() + 3);
                    durationText = "3 เดือน";
                } else if (currentTotal >= 6 && currentTotal <= 9) {
                    eDate.setMonth(eDate.getMonth() + 6);
                    durationText = "6 เดือน";
                } else {
                    eDate.setFullYear(eDate.getFullYear() + 1);
                    durationText = "1 ปี";
                }
            }

            const today = new Date();
            today.setHours(0,0,0,0);
            eDate.setHours(0,0,0,0);
            
            const diffTime = eDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let expireText = "";
            if (diffDays < 0) expireText = "หมดอายุแล้ว";
            else if (diffDays === 0) expireText = "หมดอายุวันนี้";
            else expireText = `หมดอายุใน ${diffDays} วัน`;

            return {
              ...c,
              myHistories: courseHistories,
              totalUsed: finalUsed,
              remaining: remaining,
              totalQty: currentTotal,
              computedTotalCredit: initialCredit,
              computedUsedCredit: finalBerqAmount,
              computedRemainCredit: remainingCredit,
              status: currentStatus,
              diffDays: diffDays,
              expireText: expireText,
              durationText: durationText
            };
         });"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'w') as f:
    f.write(new_content)
