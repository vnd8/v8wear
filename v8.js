const monthsData = [
    { id: "01-2026", name: "جانفي" }, { id: "02-2026", name: "فيفري" },
    { id: "03-2026", name: "مارس" }, { id: "04-2026", name: "أفريل" },
    { id: "05-2026", name: "ماي" }, { id: "06-2026", name: "جوان" },
    { id: "07-2026", name: "جويلية" }, { id: "08-2026", name: "أوت" },
    { id: "09-2026", name: "سبتمبر" }, { id: "10-2026", name: "أكتوبر" },
    { id: "11-2026", name: "نوفمبر" }, { id: "12-2026", name: "ديسمبر" }
];

let activeMonthId = "";

const dashboardView = document.getElementById('dashboardView');
const monthView = document.getElementById('monthView');
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthTitle = document.getElementById('currentMonthTitle');
const tableBody = document.getElementById('tableBody');

// جلب المصروفات المخزنة
let projectExpenses = parseFloat(localStorage.getItem('v8_project_expenses')) || 0;
document.getElementById('projectExpenses').value = projectExpenses > 0 ? projectExpenses : '';

document.getElementById('saveExpensesBtn').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('projectExpenses').value);
    projectExpenses = isNaN(val) ? 0 : val;
    localStorage.setItem('v8_project_expenses', projectExpenses);
    updateYearlyStats();
    alert("تم حفظ المصروفات بنجاح!");
});

function initDashboard() {
    calendarGrid.innerHTML = '';
    let totalYearSales = 0;
    let totalYearItems = 0;

    monthsData.forEach(month => {
        const orders = JSON.parse(localStorage.getItem('v8_orders_' + month.id)) || [];
        let monthSales = 0;
        let monthItems = 0;

        orders.forEach(order => {
            if (order.confirmed) {
                monthSales += order.price;
                monthItems++;
            }
        });

        totalYearSales += monthSales;
        totalYearItems += monthItems;

        const card = document.createElement('div');
        card.className = 'month-card';
        card.innerHTML = `
            <h2>${month.name}</h2>
            <p style="color:var(--text-muted); margin:2px 0; font-size:12px;">2026</p>
            <div class="month-stats">
                <div>المبيعات: <strong>${monthSales} د.ج</strong></div>
                <div>القطع: <strong>${monthItems}</strong></div>
            </div>
        `;
        card.onclick = () => {
            const addedBy = document.querySelector('input[name="addedBy"]:checked');
            if (!addedBy) {
                alert("يرجى تحديد هويتك (anes أو momo) أولاً قبل الدخول للشهر!");
                return;
            }
            openMonth(month.id, month.name);
        };
        calendarGrid.appendChild(card);
    });

    // تحديث إحصائيات السنة
    document.getElementById('yearTotalSales').innerText = totalYearSales + " د.ج";
    document.getElementById('yearTotalExpenses').innerText = projectExpenses + " د.ج";
    
    const netProfit = totalYearSales - projectExpenses;
    const netProfitEl = document.getElementById('yearNetProfit');
    netProfitEl.innerText = netProfit + " د.ج";
    netProfitEl.className = "value " + (netProfit >= 0 ? "positive" : "negative");

    document.getElementById('yearTotalItems').innerText = totalYearItems;
}

function updateYearlyStats() {
    initDashboard();
}

function openMonth(monthId, monthName) {
    activeMonthId = monthId;
    dashboardView.classList.add('hidden');
    monthView.classList.remove('hidden');
    currentMonthTitle.innerText = `مبيعات شهر ${monthName}`;
    renderMonthTable();
}

function renderMonthTable() {
    tableBody.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('v8_orders_' + activeMonthId)) || [];
    let totalAmount = 0;
    let totalOrders = 0;

    orders.forEach((order, index) => {
        if (order.confirmed) {
            totalAmount += order.price;
            totalOrders++;
        }

        const confirmClass = order.confirmed ? 'btn-yes' : 'btn-no';
        const confirmText = order.confirmed ? '✔ مؤكد' : '✖ غير مؤكد';
        
        const receiveClass = order.received ? 'btn-yes' : 'btn-no';
        const receiveText = order.received ? '✔ مستلم' : '✖ لم يستلم';
        
        const rowClass = order.addedBy === 'user2' ? 'user2-row' : 'user1-row';

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.innerHTML = `
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.item || '-'}</td>
            <td>${order.date}</td>
            <td>${order.price} د.ج</td>
            <td><button class="action-btn ${confirmClass}" onclick="toggleStatus(${index}, 'confirmed')">${confirmText}</button></td>
            <td><button class="action-btn ${receiveClass}" onclick="toggleStatus(${index}, 'received')">${receiveText}</button></td>
        `;
        tableBody.appendChild(tr);
    });

    document.getElementById('totalAmount').innerText = totalAmount + " د.ج";
    document.getElementById('totalOrders').innerText = totalOrders;
}

window.goBack = () => {
    initDashboard();
    monthView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
};

document.getElementById('addBtn').addEventListener('click', () => {
    const addedByInput = document.querySelector('input[name="addedBy"]:checked');
    if (!addedByInput) {
        alert("يرجى تحديد هويتك (anes أو momo) أولاً!");
        return;
    }

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const itemName = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('price').value);
    const addedBy = addedByInput.value;

    if (!name || !phone || !itemName || isNaN(price)) {
        alert("يرجى تعبئة جميع الخانات بشكل صحيح.");
        return;
    }

    const date = new Date().toLocaleDateString('en-GB');
    let orders = JSON.parse(localStorage.getItem('v8_orders_' + activeMonthId)) || [];

    orders.push({
        name, phone, item: itemName, price, date, addedBy,
        confirmed: false, received: false, timestamp: Date.now()
    });

    localStorage.setItem('v8_orders_' + activeMonthId, JSON.stringify(orders));

    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('price').value = '';

    renderMonthTable();
});

window.toggleStatus = (index, field) => {
    let orders = JSON.parse(localStorage.getItem('v8_orders_' + activeMonthId)) || [];
    orders[index][field] = !orders[index][field];
    localStorage.setItem('v8_orders_' + activeMonthId, JSON.stringify(orders));
    renderMonthTable();
};

initDashboard();