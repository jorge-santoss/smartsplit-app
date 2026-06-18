const householdRepository = require('../repositories/householdRepository');
const expenseRepository = require('../repositories/expenseRepository');
const settlementRepository = require('../repositories/settlementRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const PDFDocument = require('pdfkit');

const getExportData = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) throw new NotFoundError('Household not found');

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) throw new ForbiddenError('You are not a member of this household');

  const expenses = await expenseRepository.findAllByHouseholdId(householdId);

  const expensesWithSplits = [];
  for (const exp of expenses) {
    const splits = await expenseRepository.findSplitsByExpenseId(exp.id);
    expensesWithSplits.push({ ...exp, splits });
  }

  const settlements = await settlementRepository.findAllByHouseholdId(householdId);
  const members = await householdRepository.findMembersByHouseholdId(householdId);

  return { household, members, expenses: expensesWithSplits, settlements };
};

const generateCSV = (data) => {
  const rows = [['Date', 'Description', 'Amount', 'Category', 'Paid By', 'Split Type', 'Participants'].join(',')];

  for (const exp of data.expenses) {
    const date = exp.expense_date ? exp.expense_date.toISOString().split('T')[0] : '';
    const desc = `"${(exp.description || '').replace(/"/g, '""')}"`;
    const amount = parseFloat(exp.amount).toFixed(2);
    const category = `"${(exp.category_name || 'Uncategorized').replace(/"/g, '""')}"`;
    const payer = `"${(exp.payer_name || '').replace(/"/g, '""')}"`;
    const splitType = exp.split_type || 'equal';
    const participants = `"${exp.splits.map(s => `${s.member_name} ($${parseFloat(s.amount).toFixed(2)})`).join('; ')}"`;
    rows.push([date, desc, amount, category, payer, splitType, participants].join(','));
  }

  rows.push([].join(','));
  rows.push(['Settlements'].join(','));
  rows.push(['Date', 'From', 'To', 'Amount', 'Note'].join(','));

  for (const s of data.settlements) {
    const date = s.settlement_date ? s.settlement_date.toISOString().split('T')[0] : '';
    const from = `"${(s.from_user_name || '').replace(/"/g, '""')}"`;
    const to = `"${(s.to_user_name || '').replace(/"/g, '""')}"`;
    const amount = parseFloat(s.amount).toFixed(2);
    const note = `"${(s.note || '').replace(/"/g, '""')}"`;
    rows.push([date, from, to, amount, note].join(','));
  }

  return rows.join('\n');
};

const generatePDF = (expenses, settlements, household, members) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const TEAL = '#009688';
    const GRAY = '#6B7280';
    const LIGHT = '#B2DFDB';
    const BLACK = '#111827';
    const GREEN = '#16A34A';
    const PAGE_W = doc.page.width - 100;

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill(TEAL);
    doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold')
      .text('SmartSplit', 50, 24);
    doc.fontSize(11).font('Helvetica')
      .text(`Expense Report · ${household.name}`, 50, 52);
    doc.fillColor(BLACK);

    // Export date
    doc.moveDown(2);
    doc.fontSize(9).fillColor(GRAY)
      .text(`Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' });

    // Summary row
    const totalExp = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const totalSet = settlements.reduce((s, e) => s + parseFloat(e.amount), 0);

    doc.moveDown(0.5);
    const sumY = doc.y;
    const colW = PAGE_W / 3;

    [
      { label: 'Total Expenses', value: `$${totalExp.toFixed(2)}` },
      { label: 'Total Settled', value: `$${totalSet.toFixed(2)}` },
      { label: 'Expense Count', value: String(expenses.length) },
    ].forEach((item, i) => {
      const x = 50 + i * colW;
      doc.rect(x, sumY, colW - 8, 50).fill(LIGHT);
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
        .text(item.label, x + 8, sumY + 8, { width: colW - 16 });
      doc.fillColor(BLACK).fontSize(14).font('Helvetica-Bold')
        .text(item.value, x + 8, sumY + 22, { width: colW - 16 });
    });
    doc.fillColor(BLACK);

        // Members
    doc.moveDown(1);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK)
      .text('Members', 50, doc.y);
    doc.moveDown(0.4);

        const memY = doc.y;
    const memColW = PAGE_W / 3;
    members.forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 50 + col * memColW;
      const baseY = memY + row * 22;
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
        .text(m.name, x + 4, baseY, { width: memColW - 8 });
      doc.fillColor(BLACK).fontSize(8).font('Helvetica')
        .text(`${m.email} · ${m.role}`, x + 4, baseY + 10, { width: memColW - 8 });
      doc.fillColor(BLACK);
    });
    doc.moveDown(2);

    // Expenses table
    doc.moveDown(4.5);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK)
      .text('Expenses', 50, doc.y);
    doc.moveDown(0.4);

    const expCols = [
      { label: 'Date', x: 50, w: 70 },
      { label: 'Title', x: 120, w: 160 },
      { label: 'Category', x: 280, w: 90 },
      { label: 'Paid By', x: 370, w: 90 },
      { label: 'Amount', x: 460, w: 85 },
    ];

    const drawTableHeader = (cols) => {
      const hY = doc.y;
      doc.rect(50, hY, PAGE_W, 20).fill(TEAL);
      cols.forEach((col) => {
        doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold')
          .text(col.label, col.x + 4, hY + 6, { width: col.w - 8 });
      });
      doc.fillColor(BLACK);
      doc.moveDown(1.4);
    };

    drawTableHeader(expCols);

    expenses.forEach((exp, i) => {
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        drawTableHeader(expCols);
      }
      const rowY = doc.y;
      if (i % 2 === 0) doc.rect(50, rowY - 2, PAGE_W, 18).fill(LIGHT);
      doc.fillColor(BLACK).fontSize(8).font('Helvetica');
      doc.text(new Date(exp.expense_date).toLocaleDateString('en-US'), expCols[0].x + 4, rowY, { width: expCols[0].w - 8 });
      doc.text(exp.description || '', expCols[1].x + 4, rowY, { width: expCols[1].w - 8 });
      doc.text(exp.category_name || '—', expCols[2].x + 4, rowY, { width: expCols[2].w - 8 });
      doc.text(exp.payer_name || '', expCols[3].x + 4, rowY, { width: expCols[3].w - 8 });
      doc.text(`$${parseFloat(exp.amount).toFixed(2)}`, expCols[4].x + 4, rowY, { width: expCols[4].w - 8, align: 'right' });
      doc.moveDown(1.1);
    });

    // Total row
    doc.rect(50, doc.y, PAGE_W, 20).fill('#DCFCE7');
    doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold')
      .text('TOTAL', expCols[0].x + 4, doc.y + 6, { width: 300 });
    doc.text(`$${totalExp.toFixed(2)}`, expCols[4].x + 4, doc.y - 9, { width: expCols[4].w - 8, align: 'right' });
    doc.moveDown(2.5);

    // Settlements table
    if (doc.y > doc.page.height - 150) doc.addPage();

    doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK)
      .text('Settlements', 50, doc.y);
    doc.moveDown(0.4);

    const setlCols = [
      { label: 'Date', x: 50, w: 90 },
      { label: 'From', x: 140, w: 150 },
      { label: 'To', x: 290, w: 150 },
      { label: 'Amount', x: 440, w: 105 },
    ];

    drawTableHeader(setlCols);

    if (settlements.length === 0) {
      doc.fontSize(9).fillColor(GRAY).text('No settlements recorded.', 54, doc.y);
      doc.moveDown();
    } else {
      settlements.forEach((s, i) => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          drawTableHeader(setlCols);
        }
        const rowY = doc.y;
        if (i % 2 === 0) doc.rect(50, rowY - 2, PAGE_W, 18).fill(LIGHT);
        doc.fillColor(BLACK).fontSize(8).font('Helvetica');
        doc.text(new Date(s.settlement_date).toLocaleDateString('en-US'), setlCols[0].x + 4, rowY, { width: setlCols[0].w - 8 });
        doc.text(s.from_user_name || '', setlCols[1].x + 4, rowY, { width: setlCols[1].w - 8 });
        doc.text(s.to_user_name || '', setlCols[2].x + 4, rowY, { width: setlCols[2].w - 8 });
        doc.fillColor(GREEN).text(`$${parseFloat(s.amount).toFixed(2)}`, setlCols[3].x + 4, rowY, { width: setlCols[3].w - 8, align: 'right' });
        doc.fillColor(BLACK);
        doc.moveDown(1.1);
      });

      doc.rect(50, doc.y, PAGE_W, 20).fill('#DCFCE7');
      doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold')
        .text('TOTAL', setlCols[0].x + 4, doc.y + 6, { width: 300 });
      doc.fillColor(GREEN).text(`$${totalSet.toFixed(2)}`, setlCols[3].x + 4, doc.y - 9, { width: setlCols[3].w - 8, align: 'right' });
    }

    // Footer
    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(GRAY)
        .text(`SmartSplit · ${household.name} · Page ${i} of ${pageRange.count}`, 50, doc.page.height - 40, { align: 'center', width: PAGE_W });
    }

    doc.end();
  });

module.exports = { getExportData, generateCSV, generatePDF };