import 'package:flutter/material.dart';
import 'camera_screen.dart';

const _emojiMap = {
  'happy': '😊',
  'sad': '😢',
  'angry': '😠',
  'neutral': '😐',
  'fear': '😨',
  'surprise': '😲',
  'disgust': '🤢',
};

class ResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;
  const ResultScreen({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final emotion = result['emotion'] ?? 'unknown';
    final confidence = ((result['confidence'] ?? 0) * 100).toStringAsFixed(1);
    final songs = result['songs'] as List<dynamic>? ?? [];
    final emoji = _emojiMap[emotion] ?? '🎵';

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        title: const Text('Your Vibe', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0F0F1A),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const CameraScreen())),
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 20),
          Text(emoji, style: const TextStyle(fontSize: 64)),
          const SizedBox(height: 12),
          Text(
            emotion.toUpperCase(),
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF6C63FF)),
          ),
          Text('$confidence% confidence', style: const TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 24),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text('Songs for your mood', style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: songs.isEmpty
                ? const Center(child: Text('No songs found', style: TextStyle(color: Colors.white38)))
                : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: songs.length,
              itemBuilder: (ctx, i) {
                final song = songs[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E2E),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF6C63FF).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.music_note, color: Color(0xFF6C63FF)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(song['title'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            Text(song['artist'] ?? '', style: const TextStyle(color: Colors.white54, fontSize: 13)),
                          ],
                        ),
                      ),
                      Text(song['genre'] ?? '', style: const TextStyle(color: Colors.white38, fontSize: 12)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}