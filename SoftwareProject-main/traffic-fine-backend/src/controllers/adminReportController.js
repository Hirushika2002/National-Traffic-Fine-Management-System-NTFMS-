const ReportService = require('../services/ReportService');
const { fineExplorerQuerySchema } = require('../validators/adminValidators');

async function summary(req, res, next) {
  try {
    const result = await ReportService.summary();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function districts(req, res, next) {
  try {
    const result = await ReportService.byDistrict();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function categories(req, res, next) {
  try {
    const result = await ReportService.byCategory();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function fineExplorer(req, res, next) {
  try {
    const query = fineExplorerQuerySchema.parse(req.query);
    const result = await ReportService.explorerFilters(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, districts, categories, fineExplorer };
