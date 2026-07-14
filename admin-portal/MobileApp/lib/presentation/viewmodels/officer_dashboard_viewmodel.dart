import 'package:flutter/material.dart';
import '../../models/fine_model.dart';
import '../../data/models/officer_stats_model.dart';
import '../../data/repositories/fine_repository.dart';

/// Officer Dashboard View Model
///
/// Manages dashboard aggregates, search filters, and live search results.
class OfficerDashboardViewModel with ChangeNotifier {
  final FineRepository _fineRepo = FineRepository();

  OfficerStatsModel _stats = OfficerStatsModel.empty();
  List<FineModel> _allFines = [];
  List<FineModel> _filteredFines = [];
  bool _isLoading = false;
  String _errorMessage = '';

  // Filter criteria
  String _searchQuery = '';
  String _statusFilter = 'All'; // 'All', 'Pending', 'Paid', 'Overdue'
  DateTimeRange? _dateRange;

  // Getters
  OfficerStatsModel get stats => _stats;
  List<FineModel> get fines => _filteredFines;
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;

  String get searchQuery => _searchQuery;
  String get statusFilter => _statusFilter;
  DateTimeRange? get dateRange => _dateRange;

  /// Load stats and recent fines
  Future<void> loadDashboardData() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      // Run stats calculations and load lists in parallel
      final results = await Future.wait([
        _fineRepo.getOfficerDashboardStats(),
        _fineRepo.getAllFines(),
      ]);

      _stats = results[0] as OfficerStatsModel;
      _allFines = results[1] as List<FineModel>;
      _applyFilters();
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update search query
  void updateSearch(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  /// Update status filter
  void updateStatusFilter(String status) {
    _statusFilter = status;
    _applyFilters();
  }

  /// Update date range filter
  void updateDateRange(DateTimeRange? range) {
    _dateRange = range;
    _applyFilters();
  }

  /// Reset all filters to default
  void clearFilters() {
    _searchQuery = '';
    _statusFilter = 'All';
    _dateRange = null;
    _applyFilters();
  }

  // ── Private Helper: Apply Search Filters Locally ────────────────────
  void _applyFilters() {
    List<FineModel> temp = List.from(_allFines);

    // 1. Search Query (Driver Name, License, Vehicle, RefNo)
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      temp = temp.where((f) {
        return f.fineReferenceNumber.toLowerCase().contains(q) ||
            f.violatorName.toLowerCase().contains(q) ||
            f.violatorLicenseNumber.toLowerCase().contains(q) ||
            (f.locationDescription?.toLowerCase().contains(q) ?? false);
      }).toList();
    }

    // 2. Status Filter
    if (_statusFilter != 'All') {
      temp = temp.where((f) {
        return f.status.toLowerCase() == _statusFilter.toLowerCase();
      }).toList();
    }

    // 3. Date Range
    if (_dateRange != null) {
      final start = DateTime(_dateRange!.start.year, _dateRange!.start.month, _dateRange!.start.day);
      final end = DateTime(_dateRange!.end.year, _dateRange!.end.month, _dateRange!.end.day, 23, 59, 59);

      temp = temp.where((f) {
        return f.issuedDate.isAfter(start) && f.issuedDate.isBefore(end);
      }).toList();
    }

    _filteredFines = temp;
    notifyListeners();
  }
}
