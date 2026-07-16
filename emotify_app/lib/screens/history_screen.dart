import 'package:flutter/material.dart';
import '../services/emotion_service.dart';

const _emojiMap = {
  'happy': '😊', 'sad': '😢', 'angry': '😠',
  'neutral': '😐', 'fear': '😨', 'surprise': '😲', 'disgust': '🤢',
};

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await EmotionService.getHistory();
      setState(() { _history = data; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        title: const Text('Mood History', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0F0F1A),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : _history.isEmpty
          ? const Center(child: Text('No history yet.\nTake your first scan!', textAlign: TextAlign.center, style: TextStyle(color: Colors.white38, fontSize: 16)))
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _history.length,
        itemBuilder: (ctx, i) {
          final item = _history[i];
          final emotion = item['emotion'] ?? '';
          final confidence = ((item['confidence'] ?? 0) * 100).toStringAsFixed(1);
          final date = item['detectedAt'] ?? '';
          final emoji = _emojiMap[emotion] ?? '🎵';
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E2E),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Text(emoji, style: const TextStyle(fontSize: 32)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(emotion.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('$confidence% confidence', style: const TextStyle(color: Colors.white54, fontSize: 13)),
                    ],
                  ),
                ),
                Text(date.toString().substring(0, 10), style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ],
            ),
          );
        },
      ),
    );
  }
}