import 'dart:io';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../models/fine_model.dart';

/// PDF Service
///
/// Handles generating, downloading, and sharing digital PDF receipts for paid fines.
class PdfService {
  /// Generate and share a fine payment receipt
  static Future<void> generateAndShareReceipt(FineModel fine) async {
    final pdf = pw.Document();

    final df = DateFormat('yyyy-MM-dd HH:mm:ss');
    final currencyFormat = NumberFormat.currency(symbol: 'LKR ');

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a5,
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(16),
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: PdfColors.amber, width: 2),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.Text(
                        'SRI LANKA POLICE DEPARTMENT',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14),
                      ),
                      pw.Text(
                        'National Traffic Fine Management System (NTFMS)',
                        style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
                      ),
                      pw.SizedBox(height: 8),
                      pw.Text(
                        'DIGITAL PAYMENT RECEIPT',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 12,
                          color: PdfColors.green800,
                        ),
                      ),
                      pw.SizedBox(height: 12),
                    ],
                  ),
                ),
                pw.Divider(thickness: 1, color: PdfColors.grey),
                pw.SizedBox(height: 8),

                // Receipt Info
                _rowItem('Receipt Status:', 'SETTLED / PAID'),
                _rowItem('Payment Date:', df.format(DateTime.now())),
                _rowItem('Payment Portal:', 'NTFMS Mobile Gateway'),
                pw.SizedBox(height: 8),
                pw.Divider(thickness: 0.5),
                pw.SizedBox(height: 8),

                // Fine Details
                _rowItem('Fine Ref No:', fine.fineReferenceNumber),
                _rowItem('Offense Category:', fine.categoryId),
                _rowItem('Motorist Name:', fine.violatorName),
                _rowItem('Driving License:', fine.violatorLicenseNumber),
                _rowItem('Violation Location:', fine.locationDescription ?? 'N/A'),
                _rowItem('Issued Date:', df.format(fine.issuedDate)),
                pw.SizedBox(height: 12),

                pw.Divider(thickness: 1, color: PdfColors.grey),
                pw.SizedBox(height: 6),

                // Total Amount
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'TOTAL AMOUNT PAID:',
                      style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 11),
                    ),
                    pw.Text(
                      currencyFormat.format(fine.fineAmount),
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold, 
                        fontSize: 12, 
                        color: PdfColors.green800,
                      ),
                    ),
                  ],
                ),
                pw.SizedBox(height: 24),

                // Footer
                pw.Center(
                  child: pw.Column(
                    children: [
                      pw.Text(
                        'This is a computer-generated receipt.',
                        style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
                      ),
                      pw.Text(
                        'No signature is required. Thank you for your compliance.',
                        style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    // Save PDF to a temporary file
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/NTFMS_Receipt_${fine.fineReferenceNumber}.pdf');
    await file.writeAsBytes(await pdf.save());

    // Share the PDF file
    await Share.shareXFiles(
      [XFile(file.path)],
      subject: 'NTFMS Fine Payment Receipt - ${fine.fineReferenceNumber}',
    );
  }

  /// Helper row widget for PDF columns
  static pw.Widget _rowItem(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2.0),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey800),
          ),
          pw.Text(
            value,
            style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
          ),
        ],
      ),
    );
  }
}
