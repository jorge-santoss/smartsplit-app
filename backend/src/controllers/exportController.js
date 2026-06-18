const exportService = require('../services/exportService');

const exportData = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.id, 10);
    const format = req.params.format;
    const data = await exportService.getExportData(householdId, req.user.id);

    if (format === 'csv') {
      const csv = exportService.generateCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="household-${householdId}-expenses.csv"`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const pdfBuffer = await exportService.generatePDF(
        data.expenses,
        data.settlements,
        data.household,
        data.members,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="household-${householdId}-report.pdf"`);
      return res.send(pdfBuffer);
    }

    res.status(400).json({ error: 'Unsupported format' });
  } catch (error) {
    next(error);
  }
};

module.exports = { exportData };