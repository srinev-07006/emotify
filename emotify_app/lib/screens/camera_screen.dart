import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'dart:io';
import '../services/emotion_service.dart';
import '../services/auth_service.dart';
import 'result_screen.dart';
import 'history_screen.dart';
import 'login_screen.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _loading = false;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    _cameras = await availableCameras();
    if (_cameras != null && _cameras!.isNotEmpty) {
      // Use front camera if available
      final front = _cameras!.firstWhere(
            (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => _cameras!.first,
      );
      _controller = CameraController(front, ResolutionPreset.medium, enableAudio: false);
      await _controller!.initialize();
      if (mounted) setState(() => _initialized = true);
    }
  }

  Future<void> _capture() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    setState(() => _loading = true);
    try {
      final file = await _controller!.takePicture();
      final result = await EmotionService.detect(File(file.path));
      if (mounted) {
        Navigator.push(context, MaterialPageRoute(
          builder: (_) => ResultScreen(result: result),
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        title: const Text('EMOTIFY', style: TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F0F1A),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: Colors.white70),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () async {
              await AuthService.logout();
              if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const SizedBox(height: 20),
          const Text('How are you feeling?', style: TextStyle(color: Colors.white70, fontSize: 18)),
          const SizedBox(height: 20),
          Expanded(
            child: _initialized
                ? ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: CameraPreview(_controller!),
            )
                : const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF))),
          ),
          const SizedBox(height: 30),
          _loading
              ? const Column(children: [
            CircularProgressIndicator(color: Color(0xFF6C63FF)),
            SizedBox(height: 12),
            Text('Detecting emotion...', style: TextStyle(color: Colors.white54)),
          ])
              : GestureDetector(
            onTap: _capture,
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6C63FF),
                border: Border.all(color: Colors.white, width: 3),
              ),
              child: const Icon(Icons.camera_alt, color: Colors.white, size: 32),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}