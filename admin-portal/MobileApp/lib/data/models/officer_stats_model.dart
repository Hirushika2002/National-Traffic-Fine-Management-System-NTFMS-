/// Officer Stats Model
/// Represents overall stats shown on the Officer Dashboard
class OfficerStatsModel {
  final int totalFinesIssued;
  final int totalFinesPaid;
  final int pendingFines;
  final int todaysFinesCount;
  final double monthlyRevenue;

  OfficerStatsModel({
    required this.totalFinesIssued,
    required this.totalFinesPaid,
    required this.pendingFines,
    required this.todaysFinesCount,
    required this.monthlyRevenue,
  });

  factory OfficerStatsModel.empty() {
    return OfficerStatsModel(
      totalFinesIssued: 0,
      totalFinesPaid: 0,
      pendingFines: 0,
      todaysFinesCount: 0,
      monthlyRevenue: 0.0,
    );
  }
}
