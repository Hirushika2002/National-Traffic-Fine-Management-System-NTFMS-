const prisma = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { lookupQuerySchema, mockFineSchema } = require('../validators/fineValidators');
const { generateReferenceNo } = require('../utils/refGenerator');

async function lookup(req, res, next) {
  try {
    const { referenceNo, categoryId } = lookupQuerySchema.parse(req.query);

    const fine = await prisma.trafficFine.findFirst({
      where: { referenceNo, categoryId },
      include: { officer: true, category: true, district: true },
    });

    if (!fine) {
      throw new ApiError(404, 'No matching fine found for the given reference number and category');
    }

    res.status(200).json(fine);
  } catch (err) {
    next(err);
  }
}

async function mockCreate(req, res, next) {
  try {
    const input = mockFineSchema.parse(req.body);

    const category = await prisma.fineCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new ApiError(404, 'Fine category not found');
    }

    const fine = await prisma.trafficFine.create({
      data: {
        referenceNo: generateReferenceNo(),
        categoryId: input.categoryId,
        officerId: input.officerId,
        districtId: input.districtId,
        vehicleNo: input.vehicleNo,
        driverLicenseNo: input.driverLicenseNo,
        issueDate: new Date(),
        amount: category.baseAmount,
        status: 'PENDING',
      },
    });

    res.status(201).json(fine);
  } catch (err) {
    next(err);
  }
}