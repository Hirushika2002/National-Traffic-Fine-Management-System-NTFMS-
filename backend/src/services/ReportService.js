const prisma = require('../config/db');

class ReportService {
  static async summary() {
    const [totalCollections, totalFinesIssued, paidFinesCount, pendingFinesCount, totalPending] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amountPaid: true } }),
      prisma.trafficFine.count(),
      prisma.trafficFine.count({ where: { status: 'PAID' } }),
      prisma.trafficFine.count({ where: { status: 'PENDING' } }),
      prisma.trafficFine.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalCollections: Number(totalCollections._sum.amountPaid || 0),
      totalFinesIssued,
      paidFinesCount,
      pendingFinesCount,
      totalPending: Number(totalPending._sum.amount || 0),
    };
  }

  static async byDistrict() {
    const districts = await prisma.district.findMany({
      include: {
        fines: {
          include: { payment: true },
        },
      },
    });

    return districts.map((district) => {
      const paidFines = district.fines.filter((fine) => fine.payment);
      const totalCollected = paidFines.reduce((sum, fine) => sum + Number(fine.payment.amountPaid), 0);
      return {
        districtId: district.id,
        districtName: district.name,
        totalFinesIssued: district.fines.length,
        paidFinesCount: paidFines.length,
        totalCollected,
      };
    });
  }

  static async byCategory() {
    const categories = await prisma.fineCategory.findMany({
      include: {
        fines: {
          include: { payment: true },
        },
      },
    });

    return categories.map((category) => {
      const paidFines = category.fines.filter((fine) => fine.payment);
      const totalCollected = paidFines.reduce((sum, fine) => sum + Number(fine.payment.amountPaid), 0);
      return {
        categoryId: category.id,
        categoryCode: category.code,
        description: category.description,
        totalFinesIssued: category.fines.length,
        paidFinesCount: paidFines.length,
        totalCollected,
      };
    });
  }

  static async explorerFilters({ status, districtId, categoryId, startDate, endDate, page, limit }) {
    const where = {
      ...(status && { status }),
      ...(districtId && { districtId }),
      ...(categoryId && { categoryId }),
      ...((startDate || endDate) && {
        issueDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.trafficFine.findMany({
        where,
        include: { officer: true, district: true, category: true, payment: true },
        orderBy: { issueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trafficFine.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = ReportService;
