import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants.dart';
import 'auth_service.dart';

class EmotionService {
  static Future<Map<String, dynamic>> detect(File imageFile) async {
    final token = await AuthService.getToken();
    final bytes = await imageFile.readAsBytes();
    final base64Image = base64Encode(bytes);

    final res = await http.post(
      Uri.parse('${Constants.baseUrl}/emotion/detect'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'image': base64Image}),
    );
    return jsonDecode(res.body);
  }

  static Future<List<dynamic>> getHistory() async {
    final token = await AuthService.getToken();
    final res = await http.get(
      Uri.parse('${Constants.baseUrl}/history'),
      headers: {'Authorization': 'Bearer $token'},
    );
    return jsonDecode(res.body);
  }
}